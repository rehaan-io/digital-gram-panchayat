import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
const prisma = new PrismaClient();

// Apply admin protection to all routes in this file
router.use(authenticateJWT);
router.use((req: AuthenticatedRequest, res: Response, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admin role required.' });
  }
  next();
});

// 1. CREATE EMPLOYEE (Admin creates directly, auto-verified)
router.post('/employees', upload.single('photo'), async (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, email, password, department } = req.body;

  if (!fullName || !phone || !email || !password) {
    return res.status(400).json({ message: 'Required fields are missing.' });
  }

  try {
    // Check if email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email or phone already exists.' });
    }

    // Auto-generate employee ID: EMP-YEAR-XXXX
    const currentYear = new Date().getFullYear();
    let isUnique = false;
    let employeeId = '';
    
    while (!isUnique) {
      const randDigits = Math.floor(1000 + Math.random() * 9000);
      employeeId = `EMP-${currentYear}-${randDigits}`;
      
      const checkId = await prisma.employee.findUnique({
        where: { employeeId },
      });
      if (!checkId) {
        isUnique = true;
      }
    }

    // Auto-generate unique username
    const baseUsername = fullName.toLowerCase().replace(/\s+/g, '_').substring(0, 10);
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `emp_${baseUsername}_${uniqueSuffix}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const photoUrl = req.file ? req.file.path : null;

    // Create user and profile in transaction
    const newEmployeeUser = await prisma.user.create({
      data: {
        fullName,
        phone,
        email,
        password: hashedPassword,
        username,
        role: 'EMPLOYEE',
        isVerified: true, // Employees created by Admin are pre-verified
        employeeProfile: {
          create: {
            employeeId,
            department: department || 'General Services',
            photo: photoUrl,
          },
        },
      },
      include: {
        employeeProfile: true,
      },
    });

    return res.status(201).json({
      message: 'Employee account created successfully.',
      user: {
        id: newEmployeeUser.id,
        username: newEmployeeUser.username,
        email: newEmployeeUser.email,
        fullName: newEmployeeUser.fullName,
        role: newEmployeeUser.role,
        employeeId: newEmployeeUser.employeeProfile?.employeeId,
      },
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 2. LIST EMPLOYEES (With details and workload stats)
router.get('/employees', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            username: true,
            createdAt: true,
          },
        },
        leaves: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: {
                  in: ['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'],
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    // Format output
    const formatted = employees.map((emp) => {
      // Calculate leave status
      let leaveStatus = 'ON_DUTY';
      const pendingLeave = emp.leaves.find(l => l.status === 'PENDING');
      const activeLeave = emp.leaves.find(
        l => l.status === 'APPROVED' && now >= new Date(l.startDate) && now <= new Date(l.endDate)
      );

      if (activeLeave) {
        leaveStatus = 'ON_LEAVE';
      } else if (pendingLeave) {
        leaveStatus = 'LEAVE_REQUESTED';
      }

      return {
        id: emp.id, // Employee UUID
        userId: emp.user.id,
        employeeId: emp.employeeId,
        fullName: emp.user.fullName,
        email: emp.user.email,
        phone: emp.user.phone,
        username: emp.user.username,
        department: emp.department,
        photo: emp.photo,
        leaveStatus,
        activeTicketsCount: emp._count.assignedTickets,
        createdAt: emp.createdAt,
      };
    });

    return res.status(200).json(formatted);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 3. LIST CITIZENS
router.get('/citizens', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const citizens = await prisma.user.findMany({
      where: { role: 'CITIZEN' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        username: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { ticketsCreated: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = citizens.map((cit) => ({
      id: cit.id,
      fullName: cit.fullName,
      email: cit.email,
      phone: cit.phone,
      username: cit.username,
      isVerified: cit.isVerified,
      createdAt: cit.createdAt,
      ticketsRaised: cit._count.ticketsCreated,
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 4. DASHBOARD ANALYTICS
router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Total Counts
    const totalCitizens = await prisma.user.count({ where: { role: 'CITIZEN' } });
    const totalEmployees = await prisma.employee.count();
    const totalTickets = await prisma.ticket.count();

    // Tickets by Status
    const ticketStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'ASSIGNED', 'ON_WAY', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'];
    const statusCounts: Record<string, number> = {};
    for (const status of ticketStatuses) {
      statusCounts[status] = await prisma.ticket.count({
        where: { status: status as any },
      });
    }

    // Tickets by Category
    const tickets = await prisma.ticket.findMany({
      select: { category: true },
    });
    const categoryCounts: Record<string, number> = {};
    for (const t of tickets) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }

    // Employee Workload Distribution
    const employeesWorkload = await prisma.employee.findMany({
      select: {
        department: true,
        user: { select: { fullName: true } },
        _count: {
          select: {
            assignedTickets: {
              where: {
                status: {
                  in: ['ASSIGNED', 'ON_WAY', 'IN_PROGRESS'],
                },
              },
            },
          },
        },
      },
    });

    const workloadFormatted = employeesWorkload.map((emp) => ({
      fullName: emp.user.fullName,
      department: emp.department,
      activeCount: emp._count.assignedTickets,
    }));

    return res.status(200).json({
      totals: {
        citizens: totalCitizens,
        employees: totalEmployees,
        tickets: totalTickets,
      },
      statusDistribution: statusCounts,
      categoryDistribution: categoryCounts,
      employeeWorkload: workloadFormatted,
    });
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 5. GET ALL LEAVE REQUESTS
router.get('/leaves', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: {
        employee: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = leaves.map(l => ({
      id: l.id,
      employeeId: l.employeeId,
      employeeName: l.employee.user.fullName,
      employeeEmail: l.employee.user.email,
      employeeCode: l.employee.employeeId,
      startDate: l.startDate,
      endDate: l.endDate,
      reason: l.reason,
      status: l.status,
      createdAt: l.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// 6. APPROVE/REJECT LEAVE REQUEST
router.patch('/leaves/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body; // APPROVED or REJECTED

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be APPROVED or REJECTED.' });
  }

  try {
    const leave = await prisma.leave.update({
      where: { id: req.params.id },
      data: { status: status as any },
    });

    return res.status(200).json({ message: `Leave request ${status.toLowerCase()} successfully.`, leave });
  } catch (error: any) {
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
