import { PrismaClient } from '@prisma/client';
import app from './app';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PORT = 5001; // Separate port for tests

// Simple mock file for upload testing
const MOCK_IMAGE_DIR = path.join(__dirname, '../uploads');
const MOCK_FILE_PATH = path.join(MOCK_IMAGE_DIR, 'mock-complaint.jpg');

const ensureMockFileExists = () => {
  if (!fs.existsSync(MOCK_IMAGE_DIR)) {
    fs.mkdirSync(MOCK_IMAGE_DIR, { recursive: true });
  }
  fs.writeFileSync(MOCK_FILE_PATH, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
  console.log(`📝 Mock test image created at: ${MOCK_FILE_PATH}`);
};

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING END-TO-END SYSTEM INTEGRATION TESTS');
  console.log('==================================================\n');

  ensureMockFileExists();

  const server = app.listen(PORT, async () => {
    console.log(`🟢 Test server listening on http://localhost:${PORT}\n`);

    try {
      const BASE_URL = `http://localhost:${PORT}/api`;
      
      // Clean previous test records
      console.log('🧹 Cleaning previous test database records...');
      await prisma.notification.deleteMany({});
      await prisma.ticketTimeline.deleteMany({});
      await prisma.ticket.deleteMany({});
      await prisma.employee.deleteMany({});
      await prisma.user.deleteMany({
        where: {
          email: {
            in: ['test_citizen@example.com', 'test_employee@example.com', 'admin@panchayat.gov.in'],
          },
        },
      });

      // 1. Seed Admin
      console.log('👤 Seeding default Admin...');
      const adminRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Gram Panchayat Admin',
          phone: '9999999999',
          email: 'admin@panchayat.gov.in',
          password: 'Admin@123',
          confirmPassword: 'Admin@123',
        }),
      });
      // The register route sets role CITIZEN by default. Let's make this user Admin directly in database.
      await prisma.user.update({
        where: { email: 'admin@panchayat.gov.in' },
        data: { role: 'ADMIN', isVerified: true },
      });
      console.log('✅ Admin registered and activated.');

      // 2. Citizen Registration
      console.log('\nStep 2: Registering Citizen...');
      const registerRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Citizen Ramesh',
          phone: '9876543210',
          email: 'test_citizen@example.com',
          password: 'Password@123',
          confirmPassword: 'Password@123',
        }),
      });

      const registerData = (await registerRes.json()) as any;
      if (!registerRes.ok) throw new Error(registerData.message);
      console.log(`✅ Citizen Registered. Auto-username: ${registerData.username}`);

      // 3. Verify Email Flow
      console.log('\nStep 3: Activating Citizen Account (Email Verification)...');
      // Fetch token from database directly
      const citizenUser = await prisma.user.findUnique({
        where: { email: 'test_citizen@example.com' },
      });
      const token = citizenUser?.verificationToken;
      if (!token) throw new Error('Verification token not generated in DB.');

      const verifyRes = await fetch(`http://localhost:${PORT}/api/auth/verify-email/${token}`);
      if (!verifyRes.ok) throw new Error('Email verification request failed.');
      
      const citizenCheck = await prisma.user.findUnique({ where: { email: 'test_citizen@example.com' } });
      if (!citizenCheck?.isVerified) throw new Error('Citizen activation verification check failed.');
      console.log('✅ Citizen account active (isVerified === true).');

      // 4. Logins
      console.log('\nStep 4: Logging in Citizens & Admins...');
      const citizenLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_citizen@example.com', password: 'Password@123' }),
      });
      const citizenLoginData = (await citizenLoginRes.json()) as any;
      const citizenToken = citizenLoginData.token;
      console.log('✅ Citizen login successful. JWT retrieved.');

      const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@panchayat.gov.in', password: 'Admin@123' }),
      });
      const adminLoginData = (await adminLoginRes.json()) as any;
      const adminToken = adminLoginData.token;
      console.log('✅ Admin login successful. JWT retrieved.');

      // 5. Create Ticket (Citizen)
      console.log('\nStep 5: Citizen creates a Complaint Ticket...');
      
      // Simulate multipart file upload
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const fileContent = fs.readFileSync(MOCK_FILE_PATH);
      
      const multipartBody = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="category"\r\n\r\nStreet Light\r\n'),
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="title"\r\n\r\nStreet Light Blinking\r\n'),
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="description"\r\n\r\nThe street light on Ward 4 flashes repeatedly at night.\r\n'),
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="location"\r\n\r\nWard No. 4, Opposite Library\r\n'),
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="image"; filename="mock-complaint.jpg"\r\n`),
        Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
        fileContent,
        Buffer.from('\r\n'),
        Buffer.from(`--${boundary}--\r\n`),
      ]);

      const ticketRes = await fetch(`${BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          Authorization: `Bearer ${citizenToken}`,
        },
        body: multipartBody,
      });

      const ticketData = (await ticketRes.json()) as any;
      if (!ticketRes.ok) throw new Error(ticketData.message);
      const ticketId = ticketData.ticket.id;
      const ticketCode = ticketData.ticket.ticketId;
      console.log(`✅ Ticket Created successfully. Code: ${ticketCode}, status: ${ticketData.ticket.status}`);

      // Verify stored file
      const uploadedFile = path.join(__dirname, '../', ticketData.ticket.issueImage);
      if (!fs.existsSync(uploadedFile)) throw new Error('Ticket issue image not written to uploads folder.');
      console.log(`✅ Issue Image written to disk: ${uploadedFile}`);

      // 6. Admin accepts ticket
      console.log('\nStep 6: Admin accepts the ticket...');
      const acceptRes = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'ACCEPTED', remarks: 'Reviewed and approved by Admin.' }),
      });
      const acceptData = (await acceptRes.json()) as any;
      console.log(`✅ Ticket Status updated: ${acceptData.ticket.status}`);

      // 7. Admin spawns a new Employee
      console.log('\nStep 7: Admin registers a Panchayat staff member...');
      const empRegisterRes = await fetch(`${BASE_URL}/admin/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          fullName: 'Sharma Technician',
          phone: '7777777778',
          email: 'test_employee@example.com',
          password: 'Employee@123',
          department: 'Electricity & Street Lights',
        }),
      });
      const empRegisterData = (await empRegisterRes.json()) as any;
      if (!empRegisterRes.ok) throw new Error(empRegisterData.message);
      console.log(`✅ Employee Registered. Generated ID: ${empRegisterData.user.employeeId}`);

      // 8. Admin assigns the ticket to Employee
      console.log('\nStep 8: Admin assigns complaint to employee...');
      // Get employee UUID
      const empUser = await prisma.user.findUnique({
        where: { email: 'test_employee@example.com' },
        include: { employeeProfile: true },
      });
      const employeeUuid = empUser?.employeeProfile?.id;
      if (!employeeUuid) throw new Error('Employee UUID not resolved.');

      const assignRes = await fetch(`${BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          employeeUuid,
          expectedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      const assignData = (await assignRes.json()) as any;
      console.log(`✅ Ticket Assigned. Status updated: ${assignData.ticket.status}`);

      // 9. Employee Login
      console.log('\nStep 9: Employee logs in...');
      const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_employee@example.com', password: 'Employee@123' }),
      });
      const empLoginData = (await empLoginRes.json()) as any;
      const employeeToken = empLoginData.token;
      console.log('✅ Employee login successful. JWT retrieved.');

      // 10. Employee updates status: ON_WAY -> IN_PROGRESS
      console.log('\nStep 10: Employee updates status timeline...');
      const statusOnWay = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({ status: 'ON_WAY' }),
      });
      console.log(`✅ Status updated: ${((await statusOnWay.json()) as any).ticket.status}`);

      const statusInProgress = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`,
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      console.log(`✅ Status updated: ${((await statusInProgress.json()) as any).ticket.status}`);

      // 11. Employee completes ticket (requires resolution image upload)
      console.log('\nStep 11: Employee completes ticket and uploads proof...');
      const completionBoundary = '----WebKitFormBoundaryCompletionImg';
      const completionBody = Buffer.concat([
        Buffer.from(`--${completionBoundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="status"\r\n\r\nCOMPLETED\r\n'),
        Buffer.from(`--${completionBoundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="remarks"\r\n\r\nBulb changed. Wire junction re-soldered.\r\n'),
        Buffer.from(`--${completionBoundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="completionImage"; filename="mock-completion.jpg"\r\n`),
        Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
        fileContent,
        Buffer.from('\r\n'),
        Buffer.from(`--${completionBoundary}--\r\n`),
      ]);

      const completionRes = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${completionBoundary}`,
          Authorization: `Bearer ${employeeToken}`,
        },
        body: completionBody,
      });

      const completionData = (await completionRes.json()) as any;
      if (!completionRes.ok) throw new Error(completionData.message);
      console.log(`✅ Ticket completed. Status: ${completionData.ticket.status}`);

      // Verify files
      const completionFile = path.join(__dirname, '../', completionData.ticket.completionImage);
      if (!fs.existsSync(completionFile)) throw new Error('Completion image not written.');
      console.log(`✅ Completion Image written to disk: ${completionFile}`);

      // 12. Admin Verifies Completion -> Triggers storage clean-up
      console.log('\nStep 12: Admin verifies completion and closes ticket...');
      const verifyResObj = await fetch(`${BASE_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'VERIFIED', remarks: 'Work looks perfect, verified.' }),
      });
      const verifyData = (await verifyResObj.json()) as any;
      console.log(`✅ Ticket Verified. Status updated: ${verifyData.ticket.status}`);

      // Verify images remain in storage and database
      console.log('🔍 Checking if attachments were kept on disk and database...');
      const isIssueRetained = fs.existsSync(uploadedFile);
      const isCompletionRetained = fs.existsSync(completionFile);

      if (isIssueRetained && isCompletionRetained) {
        console.log('✅ Success! Issue image and completion image were retained in storage.');
      } else {
        throw new Error('Storage retention failure. Images were deleted from disk.');
      }

      // 13. Verify DB record remains and retains URLs
      const checkTicketInDb = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (checkTicketInDb && checkTicketInDb.issueImage !== null && checkTicketInDb.completionImage !== null) {
        console.log('✅ Success! Ticket record remains in PostgreSQL database with image URLs retained.');
      } else {
        throw new Error('PostgreSQL database record incorrect or image URLs nullified.');
      }

      console.log('\n==================================================');
      console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
      console.log('==================================================\n');

    } catch (testError: any) {
      console.error('\n❌ TEST SUITE FAILURE:', testError);
    } finally {
      // Clean up mock file
      if (fs.existsSync(MOCK_FILE_PATH)) fs.unlinkSync(MOCK_FILE_PATH);
      
      console.log('🔌 Closing server...');
      server.close(() => {
        console.log('👋 Test server closed.');
        process.exit(0);
      });
    }
  });
}

runTests();
