import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export type LanguageType = 'en' | 'te';

export const translations = {
  en: {
    // Auth & Gateway
    brandTitle: "GGP",
    brandSub: "Gorantla Grama Panchayati",
    welcomeTitle: "Let's get started",
    welcomeSub: "Good to see you back.",
    emailLabel: "Username / Email",
    passwordLabel: "Password",
    rememberMe: "Remember me next time",
    recoverPassword: "Recover Password",
    resetPassword: "Reset Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    dontHaveAccount: "Don't have account?",
    bypassPanelTitle: "Testing Bypass Panel",
    adminBypass: "Admin",
    citizenBypass: "Citizen",
    
    // Register
    registerTitle: "Create Account",
    registerSub: "Join your local Panchayat digital portal.",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    desiredPassword: "Desired Password",
    registerBtn: "Register as Citizen",
    alreadyHaveAccount: "Already have an account?",

    // Navigation/Headers
    homeTab: "Home",
    complaintsTab: "Complaints",
    profileTab: "Profile",
    staffWardsTab: "Wards",
    manageStaffTab: "Staff",
    manageTicketsTab: "Tickets",
    notificationsTab: "Notifications",
    raiseTicketTitle: "Raise a Ticket",
    myComplaintsTitle: "My Complaints",
    assignedWardsTitle: "Assigned Wards",
    manageTicketsTitle: "Manage Tickets",
    manageEmployeesTitle: "Manage Employees",
    fileComplaint: "File a Complaint",
    complaintTracking: "Complaint Tracking",
    updateProgressTitle: "Update Progress",
    myProfileTitle: "My Profile",

    // Home Screen
    welcomeHome: "P.R.I.S.M PORTAL",
    hubTitle: "Resource & Service Hub",
    hubSub: "Manage village infrastructure, school stats, water details, and check records dynamically.",
    aboutPanchayat: "About Panchayat",
    waterSupply: "Water Supply",
    streetLights: "Street Lights",
    healthSanitation: "Health & Sanitation",
    educationLiteracy: "Education & Literacy",
    agricultureLivestock: "Agriculture & Livestock",
    pensionSchemes: "Pension Schemes",
    taxRevenue: "Tax & Revenue",
    anganwadiServices: "Anganwadi Services",
    mgnregsWorks: "MGNREGS Works",
    horticultureSector: "Horticulture Sector",
    animalHusbandry: "Animal Husbandry",
    shgVoGroups: "SHG & VO groups",
    communityAssets: "Community Assets",
    addCard: "Add Card",
    openPanel: "Open Panel",
    adminDashboardMode: "⚙️ Admin Dashboard Mode",
    staffDashboardMode: "👷 Staff Dashboard Mode",
    panchayatServices: "Panchayat Services",
    
    // Generate Ticket
    issueCategory: "Category",
    selectCategory: "Select Category",
    describeIssue: "Describe the issue in detail",
    placeholderDescribe: "Enter description here...",
    contactNumber: "Contact Number",
    alternatePhone: "Alternate Phone (Optional)",
    attachPhoto: "Attach Photo (Optional)",
    chooseGallery: "Choose from Gallery",
    takePhoto: "Take Photo",
    removeImage: "Remove Image",
    submitTicket: "Submit Ticket",

    // My Tickets
    activeComplaints: "Active Complaints",
    resolvedHistory: "Resolved / History",
    noComplaintsTab: "No complaints found in this tab.",
    loadingComplaints: "Loading Complaints...",

    // Ticket Detail
    ticketId: "Ticket ID",
    statusLabel: "Status",
    reportedOn: "Reported On",
    assignedStaff: "Assigned Staff",
    unresolvedName: "Unresolved name",
    contactStaff: "Contact",
    descriptionLabel: "Description",
    attachedPhotoLabel: "Attached Photo",
    resolutionProgress: "Resolution Progress",
    expectedCompletion: "Expected Completion",
    remarksLabel: "Remarks",
    resolutionImage: "Resolution Image",
    assignStaffMember: "Assign Staff Member",
    acceptResolution: "Accept Resolution",
    rejectReopen: "Reject & Reopen",
    resolveComplaint: "Resolve Complaint",
    requestHelp: "Request Help / Escalate",
    confirmAccept: "Are you sure you want to accept this resolution?",
    confirmReject: "Are you sure you want to reject this resolution and reopen?",

    // Ticket Action (Employee Action)
    remarksActionTaken: "Remarks / Action Taken",
    placeholderActionTaken: "Enter resolution details...",
    expectedCompletionDate: "Expected Completion Date",
    selectDateBtn: "Select Date",
    uploadCompletionPhoto: "Upload Completion Photo",
    submitStatusUpdate: "Submit Status Update",

    // Admin Dashboard
    adminCitizens: "Citizens",
    adminStaff: "Panchayat Staff",
    adminTotalTickets: "Total Tickets",
    administrativeActions: "Administrative Actions",
    manageStaffSub: "Create employees, view workloads",
    resolveTicketsSub: "Assign employees, verify, reject",
    editHomepageSub: "Modify details of the services",
    broadcastNews: "Broadcast News",
    broadcastNewsSub: "Post official announcements",
    complaintStatusTracking: "Complaint Status Tracking",
    staffActiveWorkload: "Staff Active Workload",
    noEmployeeWorkload: "No active employee workload records.",
    publishAnnouncement: "Publish Announcement",
    announcementText: "This will broadcast a push/in-app notification to ALL registered citizens. Enter announcement text:",
    announcementSuccess: "Announcement posted and broadcasted successfully.",
    announcementFailed: "Posting failed.",

    // Employee Dashboard
    staffActiveComplaints: "Staff Active Complaints",
    noComplaintsAssigned: "No complaints assigned to you yet.",

    // Profile & Settings
    registeredEmail: "Registered Email",
    userAccountId: "User Account ID",
    staffEmployeeId: "Staff Employee ID",
    departmentWard: "Department / Ward",
    municipalServices: "Municipal Services",
    editProfile: "Edit Profile",
    saveProfile: "Save Profile",
    cancelBtn: "Cancel",
    profileSaved: "Your profile details have been updated successfully.",
    validationError: "Validation Error",
    fieldsCannotBlank: "Fields cannot be blank.",
    logoutBtn: "Logout",
    accountInformation: "Account Information",
    contactPhone: "Contact Phone",
    
    // Status translations
    statusPending: "Pending",
    statusAccepted: "Accepted",
    statusRejected: "Rejected",
    statusAssigned: "Assigned",
    statusOnWay: "On Way",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusVerified: "Verified",
    
    // Admin Dashboard additions
    officialAnnouncementTitle: "Official Panchayat Announcement",
    editHomepageTitle: "Edit Homepage",
    activeLabel: "Active",
    
    // Notifications
    notificationsTitle: "Notifications",
    markAllRead: "Mark All as Read",
    noNotifications: "No notifications yet.",

    // Common Buttons & Dialogs
    okBtn: "OK",
    successTitle: "Success",
    errorTitle: "Error",
    warningTitle: "Warning",
    infoTitle: "Info",
    fillAllFields: "Please fill in all fields.",
    networkError: "Network error occurred.",
    loadingText: "Loading...",
    
    // Manage Tickets
    searchPlaceholder: "Search by Title, ID, or Description...",
    searchBtn: "Search",
    filterStatus: "Status:",
    filterCategory: "Category:",
    reporterLabel: "Reporter:",
    anonymousUser: "Anonymous",
    filedDate: "Filed:",
    reviewTicket: "Review Ticket ➔",
    noTicketsMatch: "No tickets match these filters.",

    // Ticket Details
    addressLocation: "Address Location",
    filedBy: "Filed By",
    uploadedAttachments: "Uploaded Attachments",
    reportPhoto: "Report Photo",
    serviceAssignment: "Service Assignment",
    expectedResolution: "Expected Resolution",
    pendingScheduling: "Pending scheduling",
    overdueBy: "⚠️ Overdue by",
    dueToday: "🔥 Due today / tomorrow",
    daysRemaining: "✅ days remaining",
    noEmployeeAssigned: "No employee assigned to this ticket.",
    adminControls: "Admin Controls",
    acceptTicket: "Accept Ticket",
    rejectTicketTitle: "Reject Ticket",
    reassignEmployee: "Reassign Employee",
    verifyResolution: "Verify Resolution",
    workerActions: "Worker Actions",
    markOnWay: "Mark: On Way",
    markInProgress: "Mark: In Progress",
    completeWork: "Complete Work",
    activityHistoryTimeline: "Activity History Timeline",
    updatedBy: "Updated by",
    reasonForRejection: "Reason for Rejection",
    provideReasonPlaceholder: "Provide reason for rejection",
    submitReject: "Submit Reject",
    assignServiceWorker: "Assign Service Worker",
    selectStaffMember: "Select Staff Member",
    expectedDateTime: "Expected Completion Date & Time",
    setDeadlineLabel: "Set Deadline for Employee",
    deadlineLabel: "Deadline",
    assignStaff: "Assign Staff",
  },
  te: {
    // Auth & Gateway
    brandTitle: "GGP",
    brandSub: "గోరంట్ల గ్రామ పంచాయతీ",
    welcomeTitle: "లాగిన్ అవ్వండి",
    welcomeSub: "మిమ్మల్ని మళ్ళీ కలవడం సంతోషం.",
    emailLabel: "యూజర్ నేమ్ / ఈమెయిల్",
    passwordLabel: "పాస్‌వర్డ్",
    rememberMe: "నన్ను గుర్తుంచుకో",
    recoverPassword: "పాస్‌వర్డ్ తిరిగి పొందండి",
    resetPassword: "పాస్‌వర్డ్ రీసెట్ చేయి",
    signIn: "లాగిన్ చేయండి",
    signUp: "రిజిస్టర్ చేసుకోండి",
    dontHaveAccount: "ఖాతా లేదా?",
    bypassPanelTitle: "టెస్టింగ్ బైపాస్ ప్యానెల్",
    adminBypass: "అడ్మిన్",
    citizenBypass: "పౌరుడు",
    
    // Register
    registerTitle: "కొత్త ఖాతా సృష్టించండి",
    registerSub: "మీ గ్రామ పంచాయతీ డిజిటల్ పోర్టల్‌లో చేరండి.",
    fullName: "పూర్తి పేరు",
    emailAddress: "ఈమెయిల్ అడ్రస్",
    phoneNumber: "ఫోన్ నంబర్",
    desiredPassword: "పాస్‌వర్డ్",
    registerBtn: "పౌరుడిగా రిజిస్టర్ అవ్వండి",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",

    // Navigation/Headers
    homeTab: "హోమ్",
    complaintsTab: "ఫిర్యాదులు",
    profileTab: "నా ప్రొఫైల్",
    staffWardsTab: "వార్డులు",
    manageStaffTab: "సిబ్బంది",
    manageTicketsTab: "ఫిర్యాదులు",
    notificationsTab: "నోటిఫికేషన్లు",
    raiseTicketTitle: "కొత్త ఫిర్యాదు",
    myComplaintsTitle: "నా ఫిర్యాదులు",
    assignedWardsTitle: "కేటాయించిన వార్డులు",
    manageTicketsTitle: "ఫిర్యాదుల నిర్వహణ",
    manageEmployeesTitle: "సిబ్బంది నిర్వహణ",
    fileComplaint: "కొత్త ఫిర్యాదు చేయండి",
    complaintTracking: "ఫిర్యాదు ట్రాకింగ్",
    updateProgressTitle: "నవీకరణను సమర్పించండి",
    myProfileTitle: "నా ప్రొఫైల్",

    // Home Screen
    welcomeHome: "P.R.I.S.M పోర్టల్",
    hubTitle: "వనరులు & సేవల కేంద్రం",
    hubSub: "గ్రామ మౌలిక సదుపాయాలు, పాఠశాల వివరాలు, తాగునీరు మరియు రికార్డులను సులభంగా చూడండి.",
    aboutPanchayat: "గ్రామ పంచాయతీ గురించి",
    waterSupply: "మంచినీటి సరఫరా",
    streetLights: "వీధి దీపాలు",
    healthSanitation: "ఆరోగ్యం & పారిశుధ్యం",
    educationLiteracy: "విద్య & అక్షరాస్యత",
    agricultureLivestock: "వ్యవసాయం & పశుసంవర్ధకం",
    pensionSchemes: "పింఛను పథకాలు",
    taxRevenue: "పన్ను & రెవెన్యూ",
    anganwadiServices: "అంగన్‌వాడీ సేవలు",
    mgnregsWorks: "ఉపాధి హామీ పనులు",
    horticultureSector: "తోటపని / హార్టికల్చర్",
    animalHusbandry: "పశుసంవర్ధక శాఖ",
    shgVoGroups: "స్వయం సహాయక సంఘాలు",
    communityAssets: "కమ్యూనిటీ ఆస్తులు",
    addCard: "కార్డు జోడించు",
    openPanel: "ఓపెన్ ప్యానెల్",
    adminDashboardMode: "⚙️ అడ్మిన్ డ్యాష్‌బోర్డ్ మోడ్",
    staffDashboardMode: "👷 సిబ్బంది డ్యాష్‌బోర్డ్ మోడ్",
    panchayatServices: "పంచాయతీ సేవలు",
    
    // Generate Ticket
    issueCategory: "విభాగం",
    selectCategory: "విభాగాన్ని ఎంచుకోండి",
    describeIssue: "సమస్యను వివరంగా రాయండి",
    placeholderDescribe: "ఇక్కడ వివరంగా రాయండి...",
    contactNumber: "సంప్రదించవలసిన నంబర్",
    alternatePhone: "మరో ఫోన్ నంబర్ (ఐచ్ఛికం)",
    attachPhoto: "ఫోటో జతచేయండి (ఐచ్ఛికం)",
    chooseGallery: "గ్యాలరీ నుండి ఎంచుకోండి",
    takePhoto: "ఫోటో తీయండి",
    removeImage: "ఫోటో తీసివేయండి",
    submitTicket: "ఫిర్యాదును సమర్పించండి",

    // My Tickets
    activeComplaints: "ప్రస్తుత ఫిర్యాదులు",
    resolvedHistory: "పరిష్కరించబడినవి / చరిత్ర",
    noComplaintsTab: "ఈ విభాగంలో ఎటువంటి ఫిర్యాదులు లేవు.",
    loadingComplaints: "ఫిర్యాదులను లోడ్ చేస్తున్నాము...",

    // Ticket Detail
    ticketId: "ఫిర్యాదు ఐడి",
    statusLabel: "స్థితి",
    reportedOn: "ఫిర్యాదు చేసిన తేదీ",
    assignedStaff: "కేటాయించిన సిబ్బంది",
    unresolvedName: "ఇంకా కేటాయించలేదు",
    contactStaff: "సంప్రదించండి",
    descriptionLabel: "వివరణ",
    attachedPhotoLabel: "జతచేసిన ఫోటో",
    resolutionProgress: "పరిష్కార పురోగతి",
    expectedCompletion: "పరిష్కరించే అంచనా తేదీ",
    remarksLabel: "వ్యాఖ్యలు",
    resolutionImage: "పరిష్కార ఫోటో",
    assignStaffMember: "సిబ్బందిని కేటాయించండి",
    acceptResolution: "పరిష్కారాన్ని అంగీకరించు",
    rejectReopen: "తిరస్కరించు & తిరిగి తెరువు",
    resolveComplaint: "ఫిర్యాదును పరిష్కరించు",
    requestHelp: "సహాయం కోరండి / పై అధికారులకు పంపండి",
    confirmAccept: "మీరు ఈ పరిష్కారాన్ని అంగీకరిస్తున్నారా?",
    confirmReject: "మీరు ఈ పరిష్కారాన్ని తిరస్కరించి, ఫిర్యాదును తిరిగి తెరవాలనుకుంటున్నారా?",

    // Ticket Action (Employee Action)
    remarksActionTaken: "వ్యాఖ్యలు / తీసుకున్న చర్యలు",
    placeholderActionTaken: "పరిష్కార వివరాలను రాయండి...",
    expectedCompletionDate: "పరిష్కారమయ్యే అంచనా తేదీ",
    selectDateBtn: "తేదీని ఎంచుకోండి",
    uploadCompletionPhoto: "పూర్తయిన ఫోటోను అప్‌లోడ్ చేయండి",
    submitStatusUpdate: "నవీకరణను సమర్పించండి",

    // Admin Dashboard
    adminCitizens: "పౌరులు",
    adminStaff: "సిబ్బంది",
    adminTotalTickets: "మొత్తం ఫిర్యాదులు",
    administrativeActions: "పరిపాలనా చర్యలు",
    manageStaffSub: "కొత్త సిబ్బందిని చేర్చండి, వారి పనిభారాన్ని చూడండి",
    resolveTicketsSub: "సిబ్బందిని కేటాయించండి, ధృవీకరించండి, తిరస్కరించండి",
    editHomepageSub: "హోమ్‌పేజీ సేవలను సవరించండి",
    broadcastNews: "వార్తలను ప్రసారం చేయండి",
    broadcastNewsSub: "అధికారిక ప్రకటనలను పోస్ట్ చేయండి",
    complaintStatusTracking: "ఫిర్యాదుల స్థితి ట్రాకింగ్",
    staffActiveWorkload: "సిబ్బంది ప్రస్తుత పనిభారం",
    noEmployeeWorkload: "సిబ్బంది పనిభార రికార్డులు ఏవీ లేవు.",
    publishAnnouncement: "అధికారిక ప్రకటన",
    announcementText: "ఇది పౌరులందరికీ నోటిఫికేషన్ ద్వారా పంపబడుతుంది. ప్రకటనను నమోదు చేయండి:",
    announcementSuccess: "ప్రకటన విజయవంతంగా పోస్ట్ చేయబడింది.",
    announcementFailed: "పోస్ట్ చేయడం విఫలమైంది.",

    // Employee Dashboard
    staffActiveComplaints: "కేటాయించిన ఫిర్యాదులు",
    noComplaintsAssigned: "మీకు ఇంకా ఎటువంటి ఫిర్యాదులు కేటాయించబడలేదు.",

    // Profile & Settings
    registeredEmail: "నమోదిత ఈమెయిల్",
    userAccountId: "ยూజర్ ఖాతా ఐడి",
    staffEmployeeId: "స్టాఫ్ ఉద్యోగి ఐడి",
    departmentWard: "విభాగం / వార్డు",
    municipalServices: "మున్సిపల్ సేవలు",
    editProfile: "ప్రొఫైల్ సవరించండి",
    saveProfile: "ప్రొఫైల్ సేవ్ చేయండి",
    cancelBtn: "రద్దు చేయి",
    profileSaved: "మీ ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది.",
    validationError: "ధృవీకరణ లోపం",
    fieldsCannotBlank: "వివరాలు ఖాళీగా ఉండకూడదు.",
    logoutBtn: "లాగ్ అవుట్",
    accountInformation: "ఖాతా సమాచారం",
    contactPhone: "ఫోన్ నంబర్",
    
    // Status translations
    statusPending: "వేచి ఉంది",
    statusAccepted: "అంగీకరించబడింది",
    statusRejected: "తిరస్కరించబడింది",
    statusAssigned: "కేటాయించబడింది",
    statusOnWay: "ప్రయాణంలో ఉంది",
    statusInProgress: "పని జరుగుతోంది",
    statusCompleted: "పూర్తయింది",
    statusVerified: "ధృవీకరించబడింది",
    
    // Admin Dashboard additions
    officialAnnouncementTitle: "అధికారిక పంచాయతీ ప్రకటన",
    editHomepageTitle: "హోమ్‌పేజీని సవరించు",
    activeLabel: "క్రియాశీల",
    
    // Notifications
    notificationsTitle: "నోటిఫికేషన్లు",
    markAllRead: "అన్నీ చదివినట్లు గుర్తించు",
    noNotifications: "ఇంకా నోటిఫికేషన్లు ఏవీ లేవు.",

    // Common Buttons & Dialogs
    okBtn: "సరే",
    successTitle: "విజయం",
    errorTitle: "లోపం",
    warningTitle: "హెచ్చరిక",
    infoTitle: "సмаచారం",
    fillAllFields: "దయచేసి అన్ని వివరాలను నింపండి.",
    networkError: "నెట్‌వర్క్ లోపం ఏర్పడింది.",
    loadingText: "లోడ్ అవుతోంది...",
    
    // Manage Tickets
    searchPlaceholder: "శీర్షిక, ఐడి లేదా వివరణ ద్వారా శోధించండి...",
    searchBtn: "శోధించండి",
    filterStatus: "స్థితి:",
    filterCategory: "విభాగం:",
    reporterLabel: "ఫిర్యాదుదారు:",
    anonymousUser: "అజ్ఞాత",
    filedDate: "నమోదు తేదీ:",
    reviewTicket: "ఫిర్యాదు సమీక్ష ➔",
    noTicketsMatch: "ఈ ఫిల్టర్‌లకు తగిన ఫిర్యాదులు ఏవీ లేవు.",

    // Ticket Details
    addressLocation: "సమస్య ఉన్న స్థలం / చిరునామా",
    filedBy: "ఫిర్యాదుదారు",
    uploadedAttachments: "జతచేసిన ఫోటోలు",
    reportPhoto: "సమస్య ఫోటో",
    serviceAssignment: "సేవా కేటాయింపు",
    expectedResolution: "పరిష్కార గడువు",
    pendingScheduling: "ఇంకా సమయం నిర్ణయించలేదు",
    overdueBy: "⚠️ గడువు ముగిసింది",
    dueToday: "🔥 నేడు / రేపు గడువు",
    daysRemaining: "✅ రోజులు మిగిలి ఉన్నాయి",
    noEmployeeAssigned: "ఈ ఫిర్యాదుకు ఇంకా సిబ్బందిని కేటాయించలేదు.",
    adminControls: "పరిపాలనా చర్యలు",
    acceptTicket: "అంగీకరించు",
    rejectTicketTitle: "ఫిర్యాదు తిరస్కరణ",
    reassignEmployee: "సిబ్బందిని మార్చు",
    verifyResolution: "పరిష్కారాన్ని ధృవీకరించు",
    workerActions: "సిబ్బంది చర్యలు",
    markOnWay: "ప్రయాణంలో ఉన్నట్లు గుర్తించు",
    markInProgress: "పని ప్రారంభమైనట్లు గుర్తించు",
    completeWork: "పని పూర్తయినట్లు గుర్తించు",
    activityHistoryTimeline: "పురోగతి చరిత్ర కాలక్రమం",
    updatedBy: "నవీకరించిన వారు",
    reasonForRejection: "తిరస్కరణకు కారణం",
    provideReasonPlaceholder: "తిరస్కరణకు గల కారణాన్ని రాయండి",
    submitReject: "సమర్పించు",
    assignServiceWorker: "సిబ్బంది కేటాయింపు",
    selectStaffMember: "సిబ్బందిని ఎంచుకోండి",
    expectedDateTime: "పూర్తయ్యే అంచనా తేదీ & సమయం",
    setDeadlineLabel: "గడువు తేదీని నిర్ణయించండి",
    deadlineLabel: "గడువు తేదీ",
    assignStaff: "కేటాయించు",
  }
};

interface LanguageContextProps {
  language: LanguageType;
  changeLanguage: (lang: LanguageType) => Promise<void>;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>('en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const saved = await SecureStore.getItemAsync('app_language');
      if (saved === 'en' || saved === 'te') {
        setLanguage(saved);
      }
    } catch (e) {
      console.warn('Failed to load language:', e);
    }
  };

  const changeLanguage = async (lang: LanguageType) => {
    try {
      setLanguage(lang);
      await SecureStore.setItemAsync('app_language', lang);
    } catch (e) {
      console.warn('Failed to save language:', e);
    }
  };

  const t = (key: keyof typeof translations['en']): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
