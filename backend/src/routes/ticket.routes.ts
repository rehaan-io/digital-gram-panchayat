import { Router, Response } from 'express';
import { PrismaClient, TicketStatus, Role } from '@prisma/client';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';
import { upload, compressImage } from '../middleware/upload.middleware';
import { NotificationService } from '../services/notification.service';
import cloudinary from '../config/cloudinary';
import { WebSocketService } from '../services/websocket.service';

const router = Router();
const prisma = new PrismaClient();

const deleteCloudinaryImage = async (url: string | null) => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;
    
    let publicIdParts = parts.slice(uploadIndex + 1);
    if (publicIdParts[0].startsWith('v') && !isNaN(Number(publicIdParts[0].substring(1)))) {
      publicIdParts = publicIdParts.slice(1);
    }
    const filenameWithExt = publicIdParts.join('/');
    const lastDotIndex = filenameWithExt.lastIndexOf('.');
    const publicId = lastDotIndex !== -1 ? filenameWithExt.substring(0, lastDotIndex) : filenameWithExt;
    
    console.log('[Cloudinary] Deleting image with public_id:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('[Cloudinary] Destroy result:', result);
  } catch (error) {
    console.error('[Cloudinary] Failed to delete image:', error);
  }
};


// 1. CREATE TICKET (Citizen Only)
router.post(
  '/',
  authenticateJWT,
  (req: AuthenticatedRequest, res: Response, next) => {
    console.log('[Ticket] Upload request received');
    console.log('[Ticket] Content-Type:', req.headers['content-type']);
    console.log('[Ticket] Authorization header present:', !!req.headers.authorization);
    next();
  },
  upload.single('image'),
  (req: AuthenticatedRequest, res: Response, next) => {
    // This runs AFTER multer/Cloudinary finishes (or fails)
    if (req.file) {
      console.log('[Ticket] File received by multer:');
      console.log('[Ticket]   fieldname:', req.file.fieldname);
      console.log('[Ticket]   mimetype :', req.file.mimetype);
      console.log('[Ticket]   size     :', req.file.size, 'bytes');
      console.log('[Ticket]   path/url :', req.file.path);
      console.log('[Ticket]   filename :', req.file.filename);
      console.log('[Ticket] Cloudinary upload SUCCESS — URL:', req.file.path);
    } else {
      console.log('[Ticket] No file in request (ticket without image)');
    }
    next();
  },
  compressImage,
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'CITIZEN') {
      return res.status(403).json({ message: 'Only citizens can create tickets.' });
    }

    const { category, title, description, location, alternatePhone } = req.body;

    if (!category || !title || !description || !location) {
      return res.status(400).json({ message: 'Required fields are missing.' });
    }

    try {
      // Check category is valid
      const allowedCategories = [
        'Road',
        'Street Light',
        'Garbage',
        'Water Supply',
        'Drainage',
        'Hygiene',
        'Pest Control',
        'Electricity',
        'Others',
      ];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category selection.' });
      }

      // Generate Unique Ticket ID
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const ticketId = `TKT-${randomId}`;

      // Save ticket in DB using Cloudinary secure_url (populated in req.file.path by multer-storage-cloudinary)
      const imageUrl = req.file ? req.file.path : null;
      console.log('[Ticket] imageUrl to save to DB:', imageUrl);

      const ticket = await prisma.ticket.create({
        data: {
          ticketId,
          citizenId: req.user.id,
          category,
          title,
          description,
          location,
          alternatePhone: alternatePhone || null,
          issueImage: imageUrl,
          status: 'PENDING',
        },
      });

      // Create initial timeline entry
      await prisma.ticketTimeline.create({
        data: {
          ticketId: ticket.id,
          status: 'PENDING',
          remarks: 'Ticket raised by citizen.',
          actorId: req.user.id,
        },
      });

      // Send notifications
      // Citizen Notification
      await NotificationService.sendNotification({
        userId: req.user.id,
        title: 'Ticket Created successfully',
        message: `Your complaint about ${category} has been registered with ID ${ticketId}.`,
        ticketId: ticket.id,
      });

      // Admin Notification
      await NotificationService.notifyAdmins(
        'New Ticket Created',
        `A new complaint in category "${category}" has been raised by ${req.user.username} (${ticketId}).`,
        ticket.id
      );

      // Emit ticket_created event to the Citizen and Admins
      WebSocketService.sendToUser(req.user.id, 'ticket_created', ticket);
      WebSocketService.sendToRoom('admin_room', 'ticket_created', ticket);

      return res.status(201).json({
        message: 'Ticket generated successfully.',
        ticket,
      });
    } catch (error: any) {
      console.error('Create ticket error:', error);
      return res.status(500).json({ message: 'Server error: ' + error.message });
    }
  }
);

// 2. GET TICKETS (Role-scoped with filters)
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { role, id, employeeId } = req.user!;
  const { status, category, search } = req.query;

  try {
    const whereClause: any = {};

    // Filter by role scope
    if (role === 'CITIZEN') {
      whereClause.citizenId = id;
      whereClause.deletedByCitizen = false; // Hide if citizen soft-deleted it
    } else if (role === 'EMPLOYEE') {
      whereClause.employeeId = employeeId; // employeeProfile.id
    }

    // Filter by query status
    if (status) {
      whereClause.status = status as TicketStatus;
    }

    // Filter by query category
    if (category) {
      whereClause.category = category as string;
    }

    // Search filter (searches title, description, ticketId)
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { ticketId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        citizen: {
          select: {
            fullName: true,
            phone: true,
            email: true,
          },
        },
        assignedEmployee: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(tickets);
  } catch (error: any) {
    console.error('Fetch tickets error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 3. GET TICKET BY ID (Detailed, including timeline)
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        citizen: {
          select: {
            fullName: true,
            phone: true,
            email: true,
            username: true,
          },
        },
        assignedEmployee: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
        timeline: {
          include: {
            actor: {
              select: {
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Check accessibility
    if (req.user!.role === 'CITIZEN' && ticket.citizenId !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (req.user!.role === 'EMPLOYEE' && ticket.employeeId !== req.user!.employeeId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.status(200).json(ticket);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 4. UPDATE TICKET STATUS (Admin & Employee operations)
router.patch(
  '/:id/status',
  authenticateJWT,
  upload.single('completionImage'),
  compressImage,
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, remarks, rejectReason, expectedCompletion } = req.body;
    const userRole = req.user!.role;
    const userId = req.user!.id;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          assignedEmployee: true,
        },
      });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found.' });
      }

      const prevStatus = ticket.status;
      const targetStatus = status as TicketStatus;

      // ROLE VALIDATION RULES
      if (userRole === 'ADMIN') {
        const allowedAdminStatuses: TicketStatus[] = ['ACCEPTED', 'REJECTED', 'VERIFIED', 'CLOSED'];
        if (!allowedAdminStatuses.includes(targetStatus)) {
          return res.status(403).json({ message: 'Admin can only set status to ACCEPTED, REJECTED, VERIFIED, or CLOSED.' });
        }

        if (targetStatus === 'REJECTED' && !rejectReason) {
          return res.status(400).json({ message: 'Rejection reason is required.' });
        }
      } else if (userRole === 'EMPLOYEE') {
        const allowedEmployeeStatuses: TicketStatus[] = ['ON_WAY', 'IN_PROGRESS', 'COMPLETED'];
        if (!allowedEmployeeStatuses.includes(targetStatus)) {
          return res.status(403).json({ message: 'Employee can only update status to ON_WAY, IN_PROGRESS, or COMPLETED.' });
        }

        // Verify assignment
        if (ticket.employeeId !== req.user!.employeeId) {
          return res.status(403).json({ message: 'You are not assigned to this ticket.' });
        }

        // Upload verification for completion
        if (targetStatus === 'COMPLETED') {
          if (!req.file) {
            return res.status(400).json({ message: 'Completion image is required for COMPLETED status.' });
          }
          if (!remarks) {
            return res.status(400).json({ message: 'Completion remarks are required.' });
          }
        }
      } else {
        return res.status(403).json({ message: 'Citizens cannot change ticket status.' });
      }

      // OPERATIONS & UPDATE
      const updateData: any = { status: targetStatus };

      if (targetStatus === 'REJECTED') {
        updateData.rejectReason = rejectReason;
        updateData.remarks = remarks || 'Ticket Rejected.';
      }

      if (targetStatus === 'COMPLETED' && req.file) {
        updateData.completionImage = req.file.path; // Cloudinary secure_url
        console.log('[Ticket] completionImage saved:', req.file.path);
        updateData.remarks = remarks;
      }

      if (remarks && targetStatus !== 'COMPLETED') {
        updateData.remarks = remarks;
      }

      // If Admin verifies completion -> Keep the images in storage and database
      if (targetStatus === 'VERIFIED') {
        updateData.remarks = remarks || 'Ticket resolved and verified.';
      }

      if (targetStatus === 'CLOSED') {
        // Delete uploaded images from Cloudinary
        if (ticket.issueImage) {
          await deleteCloudinaryImage(ticket.issueImage);
        }
        if (ticket.completionImage) {
          await deleteCloudinaryImage(ticket.completionImage);
        }
        updateData.issueImage = null;
        updateData.completionImage = null;
        updateData.remarks = remarks || 'Ticket closed and media deleted from server.';
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: updateData,
      });

      // Write timeline entry
      await prisma.ticketTimeline.create({
        data: {
          ticketId: id,
          status: targetStatus,
          remarks: remarks || rejectReason || `Status changed to ${targetStatus}`,
          actorId: userId,
        },
      });

      // Send notifications based on transitions
      if (targetStatus === 'ACCEPTED') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Ticket Accepted',
          message: `Your ticket ${ticket.ticketId} has been accepted by the Administrator.`,
          ticketId: id,
        });
      } else if (targetStatus === 'REJECTED') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Ticket Rejected',
          message: `Your ticket ${ticket.ticketId} was rejected. Reason: ${rejectReason}`,
          ticketId: id,
        });
      } else if (targetStatus === 'ON_WAY') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Employee On Way',
          message: `The technician is on their way to resolve complaint ${ticket.ticketId}.`,
          ticketId: id,
        });
      } else if (targetStatus === 'IN_PROGRESS') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Work Started',
          message: `Work has started on your ticket ${ticket.ticketId}.`,
          ticketId: id,
        });
      } else if (targetStatus === 'COMPLETED') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Ticket Completed',
          message: `Work on your ticket ${ticket.ticketId} is complete. Pending admin verification.`,
          ticketId: id,
        });

        // Notify admin
        await NotificationService.notifyAdmins(
          'Employee Completed Ticket',
          `Employee has marked ticket ${ticket.ticketId} as completed.`,
          id
        );
      } else if (targetStatus === 'VERIFIED') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Ticket Verified',
          message: `Your ticket ${ticket.ticketId} has been verified and closed by the Admin. Thank you!`,
          ticketId: id,
        });
      } else if (targetStatus === 'CLOSED') {
        await NotificationService.sendNotification({
          userId: ticket.citizenId,
          title: 'Ticket Closed',
          message: `Your ticket ${ticket.ticketId} has been closed by the Admin. Uploaded images have been deleted.`,
          ticketId: id,
        });
      }

      // Emit specific status socket events to relevant rooms
      const targetRoomList = [
        `user_${ticket.citizenId}`,
        'admin_room',
        ...(updatedTicket.employeeId ? [`user_${updatedTicket.employeeId}`] : [])
      ];

      let statusEvent = 'ticket_updated';
      if (targetStatus === 'ACCEPTED') statusEvent = 'ticket_approved';
      else if (targetStatus === 'REJECTED') statusEvent = 'ticket_declined';
      else if (targetStatus === 'ON_WAY' || targetStatus === 'IN_PROGRESS') statusEvent = 'ticket_in_progress';
      else if (targetStatus === 'COMPLETED') statusEvent = 'ticket_completed';

      targetRoomList.forEach((room) => {
        WebSocketService.sendToRoom(room, statusEvent, updatedTicket);
        WebSocketService.sendToRoom(room, 'ticket_updated', updatedTicket);
      });

      return res.status(200).json({
        message: `Ticket status successfully updated to ${targetStatus}`,
        ticket: updatedTicket,
      });
    } catch (error: any) {
      console.error('Update ticket status error:', error);
      return res.status(500).json({ message: 'Server error: ' + error.message });
    }
  }
);

// 5. ASSIGN OR REASSIGN TICKET (Admin Only)
router.patch('/:id/assign', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admin only.' });
  }

  const { id } = req.params;
  const { employeeUuid, expectedCompletion } = req.body; // employeeUuid is Employee table ID

  if (!employeeUuid || !expectedCompletion) {
    return res.status(400).json({ message: 'Employee UUID and expected completion date are required.' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeUuid },
      include: { user: true },
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const isReassignment = !!ticket.employeeId;
    const parsedDate = new Date(expectedCompletion);

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        employeeId: employeeUuid,
        expectedCompletion: parsedDate,
        status: 'ASSIGNED',
        remarks: isReassignment
          ? `Reassigned to ${employee.user.fullName}.`
          : `Assigned to ${employee.user.fullName}.`,
      },
    });

    // Write timeline entry
    await prisma.ticketTimeline.create({
      data: {
        ticketId: id,
        status: 'ASSIGNED',
        remarks: isReassignment
          ? `Complaint reassigned to ${employee.user.fullName}. Expected completion: ${parsedDate.toLocaleDateString()}.`
          : `Complaint assigned to ${employee.user.fullName}. Expected completion: ${parsedDate.toLocaleDateString()}.`,
        expectedCompletion: parsedDate,
        actorId: req.user!.id,
      },
    });

    // Notify Citizen
    await NotificationService.sendNotification({
      userId: ticket.citizenId,
      title: isReassignment ? 'Ticket Reassigned' : 'Ticket Assigned',
      message: `Your ticket ${ticket.ticketId} has been ${
        isReassignment ? 'reassigned' : 'assigned'
      } to ${employee.user.fullName}. Expected completion: ${parsedDate.toLocaleDateString()}`,
      ticketId: id,
    });

    // Notify Employee
    await NotificationService.sendNotification({
      userId: employee.userId,
      title: isReassignment ? 'Ticket Reassigned to You' : 'New Ticket Assigned',
      message: `You have been assigned to solve complaint ${ticket.ticketId}. Deadline: ${parsedDate.toLocaleDateString()}`,
      ticketId: id,
    });

    // Emit ticket_assigned and ticket_updated events
    WebSocketService.sendToUser(employee.userId, 'ticket_assigned', updatedTicket);
    WebSocketService.sendToUser(ticket.citizenId, 'ticket_assigned', updatedTicket);
    WebSocketService.sendToRoom('admin_room', 'ticket_assigned', updatedTicket);

    WebSocketService.sendToUser(employee.userId, 'ticket_updated', updatedTicket);
    WebSocketService.sendToUser(ticket.citizenId, 'ticket_updated', updatedTicket);
    WebSocketService.sendToRoom('admin_room', 'ticket_updated', updatedTicket);

    return res.status(200).json({
      message: 'Ticket successfully assigned.',
      ticket: updatedTicket,
    });
  } catch (error: any) {
    console.error('Assign ticket error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 6. UPDATE EXPECTED COMPLETION TIME OR REMARKS (Employee / Admin)
router.patch('/:id/update-details', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { expectedCompletion, remarks } = req.body;
  const { role, employeeId, id: userId } = req.user!;

  if (!expectedCompletion && !remarks) {
    return res.status(400).json({ message: 'Expected completion date or remarks required.' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (role === 'EMPLOYEE' && ticket.employeeId !== employeeId) {
      return res.status(403).json({ message: 'You are not assigned to this ticket.' });
    }

    const updatedData: any = {};
    if (expectedCompletion) updatedData.expectedCompletion = new Date(expectedCompletion);
    if (remarks) updatedData.remarks = remarks;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updatedData,
    });

    // Timeline update
    await prisma.ticketTimeline.create({
      data: {
        ticketId: id,
        status: ticket.status,
        remarks: remarks || `Expected completion date updated to ${new Date(expectedCompletion).toLocaleDateString()}`,
        expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : undefined,
        actorId: userId,
      },
    });

    // Notifications
    if (expectedCompletion) {
      // Notify Citizen
      await NotificationService.sendNotification({
        userId: ticket.citizenId,
        title: 'Expected Completion Time Updated',
        message: `The expected resolution date for ticket ${ticket.ticketId} has been updated to ${new Date(
          expectedCompletion
        ).toLocaleDateString()}.`,
        ticketId: id,
      });

      // Notify Employee (if updated by Admin)
      if (role === 'ADMIN' && ticket.employeeId) {
        const employee = await prisma.employee.findUnique({ where: { id: ticket.employeeId } });
        if (employee) {
          await NotificationService.sendNotification({
            userId: employee.userId,
            title: 'Deadline Changed by Admin',
            message: `The deadline for ticket ${ticket.ticketId} has been changed to ${new Date(
              expectedCompletion
            ).toLocaleDateString()}.`,
            ticketId: id,
          });
        }
      }
    }

    // Emit ticket_updated socket event
    const updateTargetRooms = [
      `user_${ticket.citizenId}`,
      'admin_room',
      ...(updatedTicket.employeeId ? [`user_${updatedTicket.employeeId}`] : [])
    ];
    updateTargetRooms.forEach((room) => {
      WebSocketService.sendToRoom(room, 'ticket_updated', updatedTicket);
    });

    return res.status(200).json({
      message: 'Ticket details updated successfully.',
      ticket: updatedTicket,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 7. REQUEST HELP (Employee calls this to alert Admin)
router.post('/:id/request-help', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (req.user!.role !== 'EMPLOYEE') {
    return res.status(403).json({ message: 'Only assigned employees can request help.' });
  }

  if (!reason) {
    return res.status(400).json({ message: 'Reason for help request is required.' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket || ticket.employeeId !== req.user!.employeeId) {
      return res.status(403).json({ message: 'Access denied: You are not assigned to this ticket.' });
    }

    // Write timeline event
    await prisma.ticketTimeline.create({
      data: {
        ticketId: id,
        status: ticket.status,
        remarks: `👷 Employee requested help: "${reason}"`,
        actorId: req.user!.id,
      },
    });

    // Notify admins
    await NotificationService.notifyAdmins(
      'Employee Requested Help',
      `Employee ${req.user!.username} requested help on ticket ${ticket.ticketId}: "${reason}"`,
      id
    );

    return res.status(200).json({ message: 'Help request successfully sent to Admin.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 8. DELETE TICKET (Citizen or Admin)
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role, id: userId } = req.user!;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (role === 'ADMIN') {
      // Admin deletes permanently
      await prisma.ticket.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Ticket deleted permanently by Admin.' });
    }

    if (role === 'CITIZEN') {
      if (ticket.citizenId !== userId) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      // Check if delete is allowed for Citizen
      // "Delete ticket only if Pending, Rejected, Completed."
      const deleteableStatuses: TicketStatus[] = ['PENDING', 'REJECTED', 'COMPLETED'];
      if (!deleteableStatuses.includes(ticket.status)) {
        return res.status(400).json({
          message: 'Citizen can only delete tickets when status is Pending, Rejected, or Completed.',
        });
      }

      if (ticket.status === 'PENDING' || ticket.status === 'REJECTED') {
        // Permanently delete
        await prisma.ticket.delete({ where: { id } });
        return res.status(200).json({ message: 'Ticket deleted permanently.' });
      }

      if (ticket.status === 'COMPLETED') {
        // Soft delete: "Completed disappears only for citizen but remains for admin."
        await prisma.ticket.update({
          where: { id },
          data: { deletedByCitizen: true },
        });
        return res.status(200).json({ message: 'Ticket removed from dashboard.' });
      }
    }

    return res.status(403).json({ message: 'Invalid role for delete operation.' });
  } catch (error: any) {
    console.error('Delete ticket error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
