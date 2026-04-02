const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const resultModal = document.getElementById('resultModal');
const prizeDisplay = document.getElementById('prizeDisplay');
const couponCode = document.getElementById('couponCode');
const finalPrice = document.getElementById('finalPrice');
const leadForm = document.getElementById('leadForm');
const registrationSection = document.getElementById('registrationSection');
const gameSection = document.getElementById('gameSection');
const otpSection = document.getElementById('otpSection');
const followSection = document.getElementById('followSection');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const displayOtp = document.getElementById('displayOtp');
const sendWaMsgBtn = document.getElementById('sendWaMsgBtn');
const unlockGameBtn = document.getElementById('unlockGameBtn');
const downloadLeadsBtn = document.getElementById('downloadLeadsBtn');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

const prizes = [
    { label: 'FREE', value: 100, color: '#f59e0b', code: 'UT-FREE' }, // Gold
    { label: '10% OFF', value: 10, color: '#6366f1', code: 'UT-10OFF' }, // Blue
    { label: '50% OFF', value: 50, color: '#a855f7', code: 'UT-50OFF' }, // Purple
    { label: '20% OFF', value: 20, color: '#ec4899', code: 'UT-20OFF' }, // Pink
    { label: '60% OFF', value: 60, color: '#f43f5e', code: 'UT-60OFF' }, // Red
    { label: '30% OFF', value: 30, color: '#10b981', code: 'UT-30OFF' }, // Green
    { label: '40% OFF', value: 40, color: '#06b6d4', code: 'UT-40OFF' }, // Cyan
    { label: 'SURPRISE', value: 75, color: '#fbbf24', code: 'UT-SECRET' } // Special
];

const originalPrice = 3499;

// Calculate total rotation
let currentRotation = 0;
let isSpinning = false;

// Draw labels on the wheel
function setupWheel() {
    wheel.innerHTML = '';
    const segmentAngle = 360 / prizes.length;
    
    prizes.forEach((prize, index) => {
        const label = document.createElement('span');
        label.innerText = prize.label;
        // Each label is rotated to the middle of its slice
        // We subtract 90 because 0deg in CSS transform is 3 o'clock, 
        // but we want index 0 to start at 12 o'clock visually for calculations
        const rotation = (index * segmentAngle) + (segmentAngle / 2);
        label.style.transform = `rotate(${rotation - 90}deg)`;
        wheel.appendChild(label);
    });
}

function spin() {
    if (isSpinning || localStorage.getItem('unsaidtalks_played')) return;
    isSpinning = true;
    spinBtn.disabled = true;

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[prizeIndex];

    const segmentSize = 360 / prizes.length;
    const spins = 10 + Math.floor(Math.random() * 5); // 10 to 14 spins
    
    // The pointer is at the top (visually index 0 starts at top).
    // To land index X at the top, we need to rotate by -(X * segmentSize + offset)
    // We add a random offset within the segment for realism
    const randomOffset = Math.random() * (segmentSize * 0.8) + (segmentSize * 0.1);
    const targetRotation = (spins * 360) - (prizeIndex * segmentSize) - randomOffset;
    
    currentRotation += (targetRotation - (currentRotation % 360)) + (spins * 360);
    
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        showResult(prize);
        isSpinning = false;
        spinBtn.disabled = false;
    }, 5000); 
}

function showResult(prize) {
    prizeDisplay.innerText = prize.label + "!";
    couponCode.innerText = prize.code;
    
    const discount = (originalPrice * prize.value) / 100;
    const discountedPrice = Math.round(originalPrice - discount);
    finalPrice.innerText = discountedPrice;
    
    resultModal.classList.remove('hidden');
    
    // Confetti!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#6366f1', '#a855f7']
    });
}

function closeModal() {
    resultModal.classList.add('hidden');
}

// Global to store lead data until spin
let currentUserData = null;

spinBtn.addEventListener('click', spin);

leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get entered mobile number
    const mobile = document.getElementById('mobile').value;

    // Check 1: Device-level Lock (LocalStorage Flag)
    if (localStorage.getItem('unsaidtalks_played')) {
        alert("Bhai, aap pehle hi spin kar chuke ho! Ek person sirf ek baar hi khel sakta hai.");
        return;
    }

    // Check 2: Mobile Number Check (Lookup in local leads list)
    const existingLeads = JSON.parse(localStorage.getItem('unsaidtalks_leads') || '[]');
    const isDuplicate = existingLeads.some(lead => lead.mobile === mobile);
    
    if (isDuplicate) {
        alert("Bhai, yeh Mobile Number pehle hi use ho chuka hai! Ek number se sirf 1 spin allowed hai.");
        return;
    }

    // Collect data
    currentUserData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        mobile: mobile,
        college: document.getElementById('college').value,
        timestamp: new Date().toISOString()
    };
    
    // Backup to localStorage (Now strictly used for duplicate checks)
    existingLeads.push(currentUserData);
    localStorage.setItem('unsaidtalks_leads', JSON.stringify(existingLeads));
    
    // Smooth transition
    registrationSection.classList.add('hidden');
    followSection.classList.remove('hidden');
    step1.classList.remove('active');
    step2.classList.add('active');
});

// Social Follow - Unlocks wheel
unlockGameBtn.addEventListener('click', () => {
    followSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    gameSection.scrollIntoView({ behavior: 'smooth' });
    document.querySelector('.steps-container').classList.add('hidden');
});

function sendToGoogleForm(prizeLabel) {
    if (!currentUserData) return;

    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeXOipXKPgdfopUh9BhukVgyeERh0BQe-etS2DKUclIzQt9gg/formResponse";
    
    const body = new URLSearchParams();
    body.append("entry.678959767", currentUserData.name);
    body.append("entry.835035911", currentUserData.email);
    body.append("entry.178551229", currentUserData.mobile);
    body.append("entry.1782181021", currentUserData.college);
    body.append("entry.1085174741", prizeLabel);

    fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: body
    }).then(() => {
        console.log("Live Sync: Data sent to Google Sheets");
    }).catch(err => console.error("Sync Error:", err));
}

// Download Leads as CSV
downloadLeadsBtn.addEventListener('click', () => {
    const data = JSON.parse(localStorage.getItem('unsaidtalks_leads') || '[]');
    if (data.length === 0) {
        alert("No leads collected yet!");
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
        + "Name,Email,Mobile,College,Timestamp\n"
        + data.map(u => `${u.name},${u.email},${u.mobile},${u.college},${u.timestamp}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "unsaidtalks_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Update showResult to include Google Form Sync and 'Played' mark
function showResult(prize) {
    prizeDisplay.innerText = prize.label + "!";
    couponCode.innerText = prize.code;
    
    const discount = (originalPrice * prize.value) / 100;
    const discountedPrice = Math.round(originalPrice - discount);
    finalPrice.innerText = discountedPrice;
    
    resultModal.classList.remove('hidden');
    
    // SYNC DATA TO GOOGLE SHEETS
    sendToGoogleForm(prize.label);

    // Save playing status to local storage
    localStorage.setItem('unsaidtalks_played', 'true');
    
    // DISABLE SPIN BUTTON PERMANENTLY
    spinBtn.disabled = true;
    spinBtn.innerText = "ALREADY PLAYED";
    spinBtn.style.opacity = "0.5";
    spinBtn.style.cursor = "not-allowed";

    // Confetti!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#6366f1', '#a855f7']
    });
}

function closeModal() {
    resultModal.classList.add('hidden');
}

// Initial Played Check
if (localStorage.getItem('unsaidtalks_played')) {
    registrationSection.classList.add('hidden');
    const playedSection = document.getElementById('alreadyPlayedSection');
    if (playedSection) playedSection.classList.remove('hidden');
}

// Initialize
setupWheel();
// Correct conic gradient for visual slices
const gradientSteps = prizes.map((p, i) => `${p.color} ${i * (360/prizes.length)}deg ${(i+1) * (360/prizes.length)}deg`).join(', ');
wheel.style.background = `conic-gradient(${gradientSteps})`;
