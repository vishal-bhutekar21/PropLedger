const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'cloudflare', 'propledger-worker.js');
let raw = fs.readFileSync(targetPath, 'utf8');

// 1. Update Cache-Control to no-cache, no-store, must-revalidate
raw = raw.replace(
  "'Cache-Control': 'no-cache'",
  "'Cache-Control': 'no-cache, no-store, must-revalidate'"
);
raw = raw.replace(
  "'Cache-Control': 'no-cache'",
  "'Cache-Control': 'no-cache, no-store, must-revalidate'"
);

// 2. Add explicit window bindings right before window.addEventListener('keydown'
const targetBindingAnchor = "    // Dismiss any open modal on Escape key press";
const windowBindings = `    // Explicit global bindings for inline event attributes
    window.showToast = showToast;
    window.toggleMobileNav = toggleMobileNav;
    window.exportRentRollCsv = exportRentRollCsv;
    window.openAddUnitModal = openAddUnitModal;
    window.closeAddUnitModal = closeAddUnitModal;
    window.submitNewUnit = submitNewUnit;
    window.filterRosterTable = filterRosterTable;
    window.toggleAutoPay = toggleAutoPay;
    window.openLeaseModal = openLeaseModal;
    window.closeLeaseModal = closeLeaseModal;
    window.setBedroomFilter = setBedroomFilter;
    window.filterUnitsCombined = filterUnitsCombined;
    window.filterFaqQuestions = filterFaqQuestions;
    window.switchExperience = switchExperience;
    window.dispatchBatchBills = dispatchBatchBills;
    window.filterUnits = filterUnits;
    window.calculateRoi = calculateRoi;
    window.openPaymentModal = openPaymentModal;
    window.closePaymentModal = closePaymentModal;
    window.setPayMethod = setPayMethod;
    window.processTestPayment = processTestPayment;
    window.openTourModal = openTourModal;
    window.closeTourModal = closeTourModal;
    window.setTourType = setTourType;
    window.setTourTime = setTourTime;
    window.submitTourRequest = submitTourRequest;
    window.openMaintenanceModal = openMaintenanceModal;
    window.closeMaintenanceModal = closeMaintenanceModal;
    window.setMaintCategory = setMaintCategory;
    window.setMaintUrgency = setMaintUrgency;
    window.submitMaintenanceTicket = submitMaintenanceTicket;
    window.downloadStatementPdf = downloadStatementPdf;
    window.submitPublicQuery = submitPublicQuery;

    // Dismiss any open modal on Escape key press`;

raw = raw.replace(targetBindingAnchor, windowBindings);

fs.writeFileSync(targetPath, raw, 'utf8');
console.log('Added global bindings and no-cache headers successfully!');
