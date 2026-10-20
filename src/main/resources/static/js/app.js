let currentProfile = {
    currentAge: 0,
    retirementAge: 0,
    currentSavings: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyInvestment: 0
};

let customEvents = [];
let currentChartViewMode = 'graph';
let currentUser = null;
let lastProjectedWealth = 0;
let isCalculating = false;

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    renderCustomEventsList();
});

document.addEventListener('wheel', (e) => {
    if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
    }
}, { passive: false });

window.addEventListener('click', (e) => {
    const container = document.getElementById('userProfileMenuContainer');
    const menu = document.getElementById('userDropdownMenu');

    if (
        menu &&
        menu.style.display === 'block' &&
        container &&
        !container.contains(e.target)
    ) {
        menu.style.display = 'none';
    }
});

function toggleUserDropdown(e) {
    if (e) e.stopPropagation();

    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.display =
            menu.style.display === 'none' || !menu.style.display ? 'block' : 'none';
    }
}

function checkAuthState() {
    const savedUser = localStorage.getItem('future_finance_user');
    const authOverlay = document.getElementById('authModalOverlay');
    const userMenuContainer = document.getElementById('userProfileMenuContainer');
    const dropdownUsername = document.getElementById('dropdownUsername');

    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);

            if (authOverlay) authOverlay.style.display = 'none';
            if (userMenuContainer) userMenuContainer.style.display = 'inline-block';
            if (dropdownUsername) dropdownUsername.innerText = `👤 ${currentUser.username}`;
        } catch (e) {
            localStorage.removeItem('future_finance_user');
            if (authOverlay) authOverlay.style.display = 'flex';
        }
    } else {
        if (authOverlay) authOverlay.style.display = 'flex';
        if (userMenuContainer) userMenuContainer.style.display = 'none';
    }
}

function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tabBtnLogin');
    const tabReg = document.getElementById('tabBtnRegister');
    const formLogin = document.getElementById('loginForm');
    const formReg = document.getElementById('registerForm');
    const errBox = document.getElementById('authErrorMessage');

    if (errBox) errBox.innerText = '';

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
        formLogin.style.display = 'block';
        formReg.style.display = 'none';
    } else {
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
        formReg.style.display = 'block';
        formLogin.style.display = 'none';
    }
}

async function handleAuthSubmit(e, type) {
    e.preventDefault();

    const errBox = document.getElementById('authErrorMessage');
    if (errBox) errBox.innerText = '';

    let payload = {};
    let url = '/api/auth/login';

    if (type === 'login') {
        payload.username = document.getElementById('loginUsername').value.trim();
        payload.password = document.getElementById('loginPassword').value.trim();
    } else {
        url = '/api/auth/register';
        payload.username = document.getElementById('regUsername').value.trim();
        payload.password = document.getElementById('regPassword').value.trim();
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            currentUser = {
                id: data.id,
                username: data.username
            };

            localStorage.setItem('future_finance_user', JSON.stringify(currentUser));
            checkAuthState();
        } else {
            if (errBox) errBox.innerText = data.error || 'Authentication failed. Please try again.';
        }
    } catch (err) {
        if (errBox) errBox.innerText = 'Error connecting to database/server. Please ensure backend is running.';
    }
}

function handleSignOut() {
    currentUser = null;
    localStorage.removeItem('future_finance_user');

    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';

    const errBox = document.getElementById('authErrorMessage');
    if (errBox) errBox.innerText = '';

    checkAuthState();
}

async function saveUserHistoryToBackend() {
    if (!currentUser || !currentUser.username) return;

    const payload = {
        userId: currentUser.id || null,
        username: currentUser.username,
        currentAge: parseNumberInput('currentAge', 0),
        retirementAge: parseNumberInput('retirementAge', 0),
        currentSavings: parseNumberInput('currentSavings', 0),
        monthlyIncome: parseNumberInput('monthlyIncome', 0),
        monthlyExpenses: parseNumberInput('monthlyExpenses', 0),
        monthlyInvestment: parseNumberInput('monthlyInvestment', 0),
        targetGoalAmount: parseNumberInput('targetGoalAmount', 0),
        targetGoalYears: parseNumberInput('targetGoalYears', 0),
        customEventsJson: JSON.stringify(customEvents)
    };

    try {
        await fetch('/api/history/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.log('History save error (non-blocking):', e);
    }
}

async function showHistoryModal() {
    const modal = document.getElementById('historyModalOverlay');
    const tbody = document.getElementById('historyTableBody');

    if (!currentUser) {
        alert('Please sign in to view history.');
        return;
    }

    if (modal) modal.style.display = 'flex';

    if (tbody) {
        tbody.innerHTML =
            '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">Loading saved history...</td></tr>';
    }

    try {
        const res = await fetch(
            `/api/history/list?username=${encodeURIComponent(currentUser.username)}`
        );

        if (res.ok) {
            const list = await res.json();
            renderHistoryTable(list);
        } else {
            if (tbody) {
                tbody.innerHTML =
                    '<tr><td colspan="7" style="text-align: center; color: #ef4444;">Failed to fetch history from database.</td></tr>';
            }
        }
    } catch (err) {
        if (tbody) {
            tbody.innerHTML =
                '<tr><td colspan="7" style="text-align: center; color: #ef4444;">Error connecting to database.</td></tr>';
        }
    }
}

function closeHistoryModal() {
    const modal = document.getElementById('historyModalOverlay');
    if (modal) modal.style.display = 'none';
}

function renderHistoryTable(items) {
    const tbody = document.getElementById('historyTableBody');

    if (!tbody) return;

    if (!items || items.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No history saved yet. Click Recalculate to save progress!</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');

        const dtStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A';
        const targetStr =
            item.targetGoalAmount > 0
                ? `${formatInrCurrency(item.targetGoalAmount)} (${item.targetGoalYears} yrs)`
                : 'None';

        tr.innerHTML = `
            <td>${dtStr}</td>
            <td>${item.currentAge || '-'}</td>
            <td>${formatInrCurrency(item.currentSavings || 0)}</td>
            <td>${formatInrCurrency(item.monthlyIncome || 0)}</td>
            <td>${formatInrCurrency(item.monthlyInvestment || 0)}</td>
            <td>${targetStr}</td>
            <td>
                <button
                    class="btn btn-secondary"
                    data-item-id="${item.id}"
                    onclick="loadHistorySnapshot(this)"
                    style="padding: 0.2rem 0.5rem; font-size: 0.8rem;"
                >
                    Load
                </button>

                <button
                    class="btn btn-secondary"
                    onclick="deleteHistorySnapshot(${item.id})"
                    style="padding: 0.2rem 0.5rem; font-size: 0.8rem; background: #fee2e2; color: #dc2626;"
                >
                    Delete
                </button>
            </td>
        `;

        const loadBtn = tr.querySelector('[data-item-id]');
        loadBtn.itemData = item;

        tbody.appendChild(tr);
    });
}

function loadHistorySnapshot(btn) {
    const item = btn.itemData;
    if (!item) return;

    document.getElementById('currentAge').value = item.currentAge || '';
    document.getElementById('retirementAge').value = item.retirementAge || '';
    document.getElementById('currentSavings').value = item.currentSavings || '';
    document.getElementById('monthlyIncome').value = item.monthlyIncome || '';
    document.getElementById('monthlyExpenses').value = item.monthlyExpenses || '';
    document.getElementById('monthlyInvestment').value = item.monthlyInvestment || '';
    document.getElementById('targetGoalAmount').value = item.targetGoalAmount || '';
    document.getElementById('targetGoalYears').value = item.targetGoalYears || '';

    if (item.customEventsJson) {
        try {
            customEvents = JSON.parse(item.customEventsJson);
        } catch (e) {
            customEvents = [];
        }
    }

    closeHistoryModal();
    autoCalculateMonthlySavingsOnly();
    executeFullCalculation();
}

async function deleteHistorySnapshot(id) {
    if (!confirm('Are you sure you want to delete this history snapshot?')) return;

    try {
        const res = await fetch(`/api/history/delete/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showHistoryModal();
        }
    } catch (e) {
        alert('Failed to delete snapshot.');
    }
}

function parseNumberInput(id, defaultValue) {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === '') return defaultValue;

    const val = parseFloat(el.value.trim());
    return isNaN(val) ? defaultValue : val;
}

function loadPreset(presetName) {
    const presets = {
        student: {
            currentAge: 20,
            retirementAge: 60,
            currentSavings: 10000,
            monthlyIncome: 25000,
            monthlyExpenses: 15000,
            taxAnnualIncome: 300000
        },
        fresh_grad: {
            currentAge: 23,
            retirementAge: 58,
            currentSavings: 50000,
            monthlyIncome: 55000,
            monthlyExpenses: 30000,
            taxAnnualIncome: 660000
        },
        professional: {
            currentAge: 30,
            retirementAge: 55,
            currentSavings: 500000,
            monthlyIncome: 120000,
            monthlyExpenses: 60000,
            taxAnnualIncome: 1440000
        }
    };

    const p = presets[presetName];
    if (!p) return;

    document.getElementById('currentAge').value = p.currentAge;
    document.getElementById('retirementAge').value = p.retirementAge;
    document.getElementById('currentSavings').value = p.currentSavings;
    document.getElementById('monthlyIncome').value = p.monthlyIncome;
    document.getElementById('monthlyExpenses').value = p.monthlyExpenses;
    document.getElementById('taxAnnualIncome').value = p.taxAnnualIncome;

    autoCalculateMonthlySavingsOnly();
    calculateIncomeTax();
}

function autoCalculateMonthlySavingsOnly() {
    const income = parseNumberInput('monthlyIncome', 0);
    const expenses = parseNumberInput('monthlyExpenses', 0);
    const investEl = document.getElementById('monthlyInvestment');

    if (investEl) {
        investEl.value = Math.max(0, income - expenses);
    }

    const taxInput = document.getElementById('taxAnnualIncome');
    if (taxInput && income > 0 && (!taxInput.value || taxInput.value == 0)) {
        taxInput.value = income * 12;
    }
}

async function executeFullCalculation() {
    if (isCalculating) return;

    const btn = document.getElementById('recalcBtn');
    const loader = document.getElementById('recalcLoader');
    const btnText = document.getElementById('recalcBtnText');

    isCalculating = true;

    if (loader) loader.style.display = 'inline-block';
    if (btnText) btnText.innerText = 'Calculating...';
    if (btn) btn.disabled = true;

    try {
        runSimulation();
        calculateIncomeTax();
        await saveUserHistoryToBackend();
    } catch (e) {
        console.error('Calculation error:', e);
    } finally {
        setTimeout(() => {
            if (loader) loader.style.display = 'none';
            if (btnText) btnText.innerText = 'Recalculate Wealth & Tax Plan (₹)';
            if (btn) btn.disabled = false;
            isCalculating = false;
        }, 400);
    }
}

function calculateIncomeTax() {
    const annualIncome = parseNumberInput('taxAnnualIncome', 0);
    const totalOldExemptions = 50000;

    const newStdDeduction = 75000;
    const newTaxableIncome = Math.max(0, annualIncome - newStdDeduction);

    let rawNewTax = 0;
    let newRebateStr = 'Not Applicable';

    if (newTaxableIncome <= 400000) {
        rawNewTax = 0;
    } else if (newTaxableIncome <= 800000) {
        rawNewTax = (newTaxableIncome - 400000) * 0.05;
    } else if (newTaxableIncome <= 1200000) {
        rawNewTax = 20000 + (newTaxableIncome - 800000) * 0.10;
    } else if (newTaxableIncome <= 1600000) {
        rawNewTax = 60000 + (newTaxableIncome - 1200000) * 0.15;
    } else if (newTaxableIncome <= 2000000) {
        rawNewTax = 120000 + (newTaxableIncome - 1600000) * 0.20;
    } else if (newTaxableIncome <= 2400000) {
        rawNewTax = 200000 + (newTaxableIncome - 2000000) * 0.25;
    } else {
        rawNewTax = 300000 + (newTaxableIncome - 2400000) * 0.30;
    }

    let newTax = rawNewTax;

    if (newTaxableIncome <= 1200000) {
        newTax = 0;
        newRebateStr = 'Eligible u/s 87A (Zero Tax)';
    } else {
        const excessIncome = newTaxableIncome - 1200000;

        if (rawNewTax > excessIncome) {
            newTax = excessIncome;
            newRebateStr = 'Marginal Relief Applied u/s 87A';
        } else {
            newRebateStr = 'Not Applicable';
        }
    }

    const newCess = newTax * 0.04;
    const totalNewTax = Math.round(newTax + newCess);

    const oldTaxableIncome = Math.max(0, annualIncome - totalOldExemptions);
    let rawOldTax = 0;

    if (oldTaxableIncome <= 250000) {
        rawOldTax = 0;
    } else if (oldTaxableIncome <= 500000) {
        rawOldTax = (oldTaxableIncome - 250000) * 0.05;
    } else if (oldTaxableIncome <= 1000000) {
        rawOldTax = 12500 + (oldTaxableIncome - 500000) * 0.20;
    } else {
        rawOldTax = 112500 + (oldTaxableIncome - 1000000) * 0.30;
    }

    let oldTax = rawOldTax;

    if (oldTaxableIncome <= 500000) {
        oldTax = Math.max(0, rawOldTax - Math.min(rawOldTax, 12500));
    }

    const oldCess = oldTax * 0.04;
    const totalOldTax = Math.round(oldTax + oldCess);

    document.getElementById('taxNewRegimeVal').innerText = formatInrCurrency(totalNewTax);
    document.getElementById('taxNewGross').innerText = formatInrCurrency(annualIncome);
    document.getElementById('taxNewTaxable').innerText = formatInrCurrency(newTaxableIncome);
    document.getElementById('taxNewRebate').innerText = newRebateStr;
    document.getElementById('taxNewCess').innerText = formatInrCurrency(newCess);

    document.getElementById('taxOldRegimeVal').innerText = formatInrCurrency(totalOldTax);
    document.getElementById('taxOldGross').innerText = formatInrCurrency(annualIncome);
    document.getElementById('taxOldTaxable').innerText = formatInrCurrency(oldTaxableIncome);
    document.getElementById('taxOldCess').innerText = formatInrCurrency(oldCess);

    const badgeNew = document.getElementById('badgeNewRegime');
    const badgeOld = document.getElementById('badgeOldRegime');
    const cardNew = document.getElementById('cardNewRegime');
    const cardOld = document.getElementById('cardOldRegime');
    const recBox = document.getElementById('taxRecommendationText');

    const diff = Math.abs(totalOldTax - totalNewTax);

    if (totalNewTax <= totalOldTax) {
        badgeNew.className = 'tax-badge recommended';
        badgeNew.innerText = 'RECOMMENDED';

        badgeOld.className = 'tax-badge';
        badgeOld.innerText = 'OPTION';

        if (cardNew) cardNew.style.borderColor = '#4f46e5';
        if (cardOld) cardOld.style.borderColor = '#e2e8f0';

        recBox.innerHTML =
            `<strong>Tax Recommendation:</strong> The <strong>New Tax Regime</strong> saves you <strong>${formatInrCurrency(diff)}</strong> annually!`;
    } else {
        badgeOld.className = 'tax-badge recommended';
        badgeOld.innerText = 'RECOMMENDED';

        badgeNew.className = 'tax-badge';
        badgeNew.innerText = 'OPTION';

        if (cardOld) cardOld.style.borderColor = '#10b981';
        if (cardNew) cardNew.style.borderColor = '#e2e8f0';

        recBox.innerHTML =
            `<strong>Tax Recommendation:</strong> The <strong>Old Tax Regime</strong> saves you <strong>${formatInrCurrency(diff)}</strong> annually!`;
    }
}

function calculateWealthOverYears() {
    const currentSavings = parseNumberInput('currentSavings', 0);
    const baseMonthlySavings = parseNumberInput('monthlyInvestment', 0);
    const currentAge = parseNumberInput('currentAge', 22);
    const retirementAge = parseNumberInput('retirementAge', 60);

    const years = Math.max(1, retirementAge - currentAge);
    const totalMonths = years * 12;

    let accumulatedWealth = currentSavings;

    for (let m = 1; m <= totalMonths; m++) {
        let monthlySavingsForMonth = baseMonthlySavings;

        customEvents.forEach(event => {
            const startMonth = event.month || 1;
            let endMonth = totalMonths;

            if (event.duration > 0) {
                endMonth = startMonth + event.duration - 1;
            }

            if (m >= startMonth && m <= endMonth) {
                if (event.type === '+') {
                    monthlySavingsForMonth += event.amount;
                } else {
                    monthlySavingsForMonth -= event.amount;
                }
            }
        });

        accumulatedWealth += monthlySavingsForMonth;
    }

    return Math.round(accumulatedWealth);
}

function calculateTargetGoal() {
    const targetAmountInput = document.getElementById('targetGoalAmount').value.trim();
    const targetYearsInput = document.getElementById('targetGoalYears').value.trim();

    const targetAmount = parseFloat(targetAmountInput);
    const targetYears = parseInt(targetYearsInput);

    lastProjectedWealth = calculateWealthOverYears();

    if (
        !targetAmountInput ||
        isNaN(targetAmount) ||
        targetAmount <= 0 ||
        !targetYearsInput ||
        isNaN(targetYears) ||
        targetYears <= 0
    ) {
        document.getElementById('targetReqYear').innerText = '₹0 / Year';
        document.getElementById('targetReqMonth').innerText = '₹0 / Month';
        document.getElementById('targetEstYears').innerText = 'Enter Target Goal & Timeline';
        updateRetirementReadinessScore(lastProjectedWealth);
        return;
    }

    const currentSavings = parseNumberInput('currentSavings', 0);
    const baseMonthlySavings = parseNumberInput('monthlyInvestment', 0);
    const currentAge = parseNumberInput('currentAge', 22);
    const retirementAge = parseNumberInput('retirementAge', 60);

    const maxMonths = Math.max(1, (retirementAge - currentAge) * 12);

    let simAccumulated = currentSavings;
    let estYearsStr = `Not Reachable by Age ${retirementAge}`;
    let reached = false;

    for (let m = 1; m <= maxMonths; m++) {
        let monthlySavingsForMonth = baseMonthlySavings;

        customEvents.forEach(event => {
            const startMonth = event.month || 1;
            let endMonth = maxMonths;

            if (event.duration > 0) {
                endMonth = startMonth + event.duration - 1;
            }

            if (m >= startMonth && m <= endMonth) {
                if (event.type === '+') {
                    monthlySavingsForMonth += event.amount;
                } else {
                    monthlySavingsForMonth -= event.amount;
                }
            }
        });

        simAccumulated += monthlySavingsForMonth;

        if (simAccumulated >= targetAmount) {
            const yearsHit = (m / 12).toFixed(1);
            estYearsStr = `${yearsHit} Years (${m} Months)`;
            reached = true;
            break;
        }
    }

    if (!reached) {
        estYearsStr = `Not Reachable by Age ${retirementAge}`;
    }

    const reqPerYear = Math.max(0, targetAmount - currentSavings) / targetYears;
    const reqPerMonth = reqPerYear / 12;

    document.getElementById('targetReqYear').innerText =
        `${formatInrCurrency(reqPerYear)} / Year`;
    document.getElementById('targetReqMonth').innerText =
        `${formatInrCurrency(reqPerMonth)} / Month`;
    document.getElementById('targetEstYears').innerText = estYearsStr;

    updateRetirementReadinessScore(lastProjectedWealth);
}

function addCustomEvent() {
    const name = document.getElementById('eventName').value.trim();
    const month = parseNumberInput('eventMonth', 0);
    const duration = parseNumberInput('eventDuration', 0);
    const amount = parseNumberInput('eventAmount', 0);
    const type = document.getElementById('eventType').value;

    if (!name) {
        alert('Please enter an event name');
        return;
    }

    if (month <= 0) {
        alert('Please enter a valid month');
        return;
    }

    if (amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const newEvent = {
        id: Date.now(),
        name: name,
        month: month,
        duration: duration >= 0 ? duration : 0,
        year: Math.ceil(month / 12),
        amount: amount,
        type: type
    };

    customEvents.push(newEvent);

    document.getElementById('eventName').value = '';
    document.getElementById('eventMonth').value = '';
    document.getElementById('eventDuration').value = '';
    document.getElementById('eventAmount').value = '';

    renderCustomEventsList();
    runSimulation();
}

function removeCustomEvent(id) {
    customEvents = customEvents.filter(e => e.id !== id);
    renderCustomEventsList();
    runSimulation();
}

function renderCustomEventsList() {
    const list = document.getElementById('eventsList');
    if (!list) return;

    list.innerHTML = '';

    if (customEvents.length === 0) {
        list.innerHTML =
            '<span style="color: var(--text-secondary); font-size: 0.95rem;">No custom life events added yet.</span>';
        return;
    }

    customEvents.forEach(e => {
        const badge = document.createElement('div');
        badge.className = 'event-badge';

        let durStr = 'Lifetime';

        if (e.duration === 1) {
            durStr = '1 Month (One-time)';
        } else if (e.duration > 1) {
            durStr = `${e.duration} Months`;
        }

        const typeSymbol = e.type === '+' ? '+' : '-';
        const typeColor = e.type === '+' ? '#10b981' : '#ef4444';
        const typeLabel = e.type === '+' ? ` (+ Increase - ${durStr})` : ` (- Decrease - ${durStr})`;

        badge.innerHTML = `
            <span>
                <strong>${e.name}</strong> (Month ${e.month})${typeLabel}:
                <span style="color: ${typeColor}">${typeSymbol}${formatInrCurrency(e.amount)}</span>
            </span>
            <span class="remove-btn" onclick="removeCustomEvent(${e.id})">&times;</span>
        `;

        list.appendChild(badge);
    });
}

function runSimulation() {
    const ageInput = parseNumberInput('currentAge', 22);
    const retAgeInput = parseNumberInput('retirementAge', 55);
    const savingsInput = parseNumberInput('currentSavings', 0);
    const incomeInput = parseNumberInput('monthlyIncome', 0);
    const expensesInput = parseNumberInput('monthlyExpenses', 0);
    const investInput = parseNumberInput('monthlyInvestment', 0);

    currentProfile = {
        currentAge: ageInput,
        retirementAge: retAgeInput,
        currentSavings: savingsInput,
        monthlyIncome: incomeInput,
        monthlyExpenses: expensesInput,
        monthlyInvestment: investInput
    };

    lastProjectedWealth = calculateWealthOverYears();

    calculateTargetGoal();
    fetchSimulationResult();
}

async function fetchSimulationResult() {
    const payload = {
        profile: currentProfile,
        customEvents: customEvents
    };

    try {
        const response = await fetch('/api/finance/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            renderBackendResults(data);
        } else {
            fallbackDirectCalculation();
        }
    } catch (error) {
        fallbackDirectCalculation();
    }
}

function renderBackendResults(result) {
    document.getElementById('metricMedianWealth').innerText =
        formatInrCurrency(result.medianRetirementWealth);

    document.getElementById('metricAnnualSavings').innerText =
        `${formatInrCurrency(currentProfile.monthlyInvestment * 12)} / Year`;

    initChart(result.ageLabels, result.expected50th);
    populateWealthTable(result.ageLabels, result.expected50th);

    lastProjectedWealth = result.medianRetirementWealth;
    updateRetirementReadinessScore(result.medianRetirementWealth);

    const storyEl = document.getElementById('storyText');
    if (storyEl) {
        storyEl.innerHTML = result.aiNarrativeStory.startsWith('<')
            ? result.aiNarrativeStory
            : `"${result.aiNarrativeStory}"`;
    }
}

function updateRetirementReadinessScore(projectedWealth) {
    if (projectedWealth !== undefined && projectedWealth !== null && projectedWealth > 0) {
        lastProjectedWealth = projectedWealth;
    } else if (lastProjectedWealth > 0) {
        projectedWealth = lastProjectedWealth;
    } else {
        lastProjectedWealth = calculateWealthOverYears();
        projectedWealth = lastProjectedWealth;
    }

    const retirementAge = parseNumberInput('retirementAge', 60);
    const currentAge = parseNumberInput('currentAge', 22);
    const monthlyExpenses = parseNumberInput('monthlyExpenses', 0);
    const retirementYears = Math.max(1, retirementAge - currentAge);

    const targetAmountInput = document.getElementById('targetGoalAmount').value.trim();
    const targetAmount = parseFloat(targetAmountInput);

    let neededCorpus = 0;

    if (!isNaN(targetAmount) && targetAmount > 0) {
        neededCorpus = targetAmount;
    } else if (monthlyExpenses > 0) {
        neededCorpus = monthlyExpenses * 12 * retirementYears;
    } else {
        neededCorpus = 5000000;
    }

    let scorePercent = 0;

    if (neededCorpus > 0 && projectedWealth > 0) {
        scorePercent = Math.min(100, Math.round((projectedWealth / neededCorpus) * 100));
        if (isNaN(scorePercent) || scorePercent < 0) scorePercent = 0;
    }

    const elemBadge = document.getElementById('readinessBadge');
    const elemFill = document.getElementById('readinessProgressFill');
    const elemTargetBox = document.getElementById('targetGoalSummaryBox');

    let badgeText = `${scorePercent}% ✓ Good`;
    let badgeColor = '#10b981';

    if (scorePercent >= 90) {
        badgeText = `${scorePercent}% ✓ Excellent`;
        badgeColor = '#10b981';
    } else if (scorePercent >= 70) {
        badgeText = `${scorePercent}% ✓ Good`;
        badgeColor = '#10b981';
    } else if (scorePercent >= 50) {
        badgeText = `${scorePercent}% ⚠ Moderate`;
        badgeColor = '#f59e0b';
    } else {
        badgeText = `${scorePercent}% ⚠ Needs Attention`;
        badgeColor = '#ef4444';
    }

    if (elemBadge) {
        elemBadge.innerText = badgeText;
        elemBadge.style.backgroundColor = badgeColor;
    }

    if (elemFill) {
        elemFill.style.width = `${scorePercent}%`;
        elemFill.style.backgroundColor = badgeColor;
    }

    const targetYearsInput = document.getElementById('targetGoalYears').value.trim();
    const targetYears = parseInt(targetYearsInput);

    if (elemTargetBox) {
        if (
            targetAmountInput &&
            !isNaN(targetAmount) &&
            targetAmount > 0 &&
            targetYearsInput &&
            !isNaN(targetYears) &&
            targetYears > 0
        ) {
            const currentSavings = parseNumberInput('currentSavings', 0);
            const reqPerYear = Math.max(0, targetAmount - currentSavings) / targetYears;
            const reqPerMonth = Math.ceil(reqPerYear / 12);

            let targetText =
                `You need <strong>${formatInrCurrency(targetAmount)}</strong> for <strong>${targetYears}</strong> years. To achieve this, save <strong>${formatInrCurrency(reqPerMonth)}</strong> per month.`;

            const currentMonthlySavings = parseNumberInput('monthlyInvestment', 0);

            if (currentMonthlySavings < reqPerMonth) {
                const addSavings = reqPerMonth - currentMonthlySavings;
                targetText +=
                    `<br>With your current monthly savings of <strong>${formatInrCurrency(currentMonthlySavings)}</strong>, this target timeline is not achievable. Increase by <strong>${formatInrCurrency(addSavings)}/month</strong>.`;
            } else {
                targetText +=
                    `<br>Your current savings rate of <strong>${formatInrCurrency(currentMonthlySavings)}/month</strong> is sufficient to reach this target.`;
            }

            elemTargetBox.innerHTML = targetText;
            elemTargetBox.style.display = 'block';
        } else {
            elemTargetBox.style.display = 'none';
        }
    }
}

function fallbackDirectCalculation() {
    const years = Math.max(1, currentProfile.retirementAge - currentProfile.currentAge);
    const totalMonths = years * 12;
    const labels = [];
    const directWealthData = [];

    const baseMonthlySavings = currentProfile.monthlyInvestment;
    let accumulatedWealth = currentProfile.currentSavings;

    let deficitYear = -1;
    let maxDeficit = 0;

    labels.push(`Age ${currentProfile.currentAge}`);
    directWealthData.push(accumulatedWealth);

    for (let m = 1; m <= totalMonths; m++) {
        let monthlySavingsForMonth = baseMonthlySavings;

        customEvents.forEach(event => {
            const startMonth = event.month || 1;
            let endMonth = totalMonths;

            if (event.duration > 0) {
                endMonth = startMonth + event.duration - 1;
            }

            if (m >= startMonth && m <= endMonth) {
                if (event.type === '+') {
                    monthlySavingsForMonth += event.amount;
                } else {
                    monthlySavingsForMonth -= event.amount;
                }
            }
        });

        accumulatedWealth += monthlySavingsForMonth;

        if (accumulatedWealth < 0 && deficitYear === -1) {
            deficitYear = Math.ceil(m / 12);
        }

        if (accumulatedWealth < 0 && Math.abs(accumulatedWealth) > maxDeficit) {
            maxDeficit = Math.abs(accumulatedWealth);
        }

        if (m % 12 === 0) {
            const yr = m / 12;
            labels.push(`Age ${currentProfile.currentAge + yr}`);
            directWealthData.push(Math.round(accumulatedWealth));
        }
    }

    const finalWealth = directWealthData[directWealthData.length - 1];

    document.getElementById('metricMedianWealth').innerText = formatInrCurrency(finalWealth);
    document.getElementById('metricAnnualSavings').innerText =
        `${formatInrCurrency(baseMonthlySavings * 12)} / Year`;

    initChart(labels, directWealthData);
    populateWealthTable(labels, directWealthData);

    lastProjectedWealth = finalWealth;
    updateRetirementReadinessScore(finalWealth);

    if (deficitYear !== -1) {
        const reqSalaryBoost = Math.round((maxDeficit / 12) + (currentProfile.monthlyExpenses * 0.2));
        const reqSavingsBoost = Math.round(maxDeficit / Math.max(1, deficitYear * 12));

        document.getElementById('storyText').innerHTML =
            `<strong>Deficit Warning in Year ${deficitYear}!</strong> Your projected balance drops into a negative deficit of <strong>${formatInrCurrency(maxDeficit)}</strong>.<br>` +
            `<strong>Action Recommendations:</strong> Consider increasing your monthly salary by at least <strong>${formatInrCurrency(reqSalaryBoost)}</strong>, or boosting monthly savings by <strong>${formatInrCurrency(reqSavingsBoost)}</strong> prior to Year ${deficitYear} to prevent deficit.`;
    } else {
        let eventDetail = customEvents.length > 0
            ? ` Factoring in your planned event (${customEvents[0].name} at Month ${customEvents[0].month}),`
            : '';

        document.getElementById('storyText').innerHTML =
            `"Starting with a current savings of ${formatInrCurrency(currentProfile.currentSavings)} and saving ${formatInrCurrency(currentProfile.monthlyInvestment)} monthly (${formatInrCurrency(currentProfile.monthlyInvestment * 12)} per year), your total accumulated wealth will reach ${formatInrCurrency(finalWealth)} over ${years} years by age ${currentProfile.retirementAge}.${eventDetail}"`;
    }
}

function populateWealthTable(labels, wealthData) {
    const tbody = document.getElementById('wealthTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const baseMonthlySavings = currentProfile.monthlyInvestment;

    labels.forEach((label, index) => {
        const tr = document.createElement('tr');

        let eventTextParts = [];

        customEvents.forEach(e => {
            const startMonth = e.month || 1;
            let endMonth = labels.length * 12;

            if (e.duration > 0) {
                endMonth = startMonth + e.duration - 1;
            }

            const currentYearStartMonth = (index - 1) * 12 + 1;
            const currentYearEndMonth = index * 12;

            if (index > 0 && currentYearEndMonth >= startMonth && currentYearStartMonth <= endMonth) {
                const signStr = e.type === '+' ? '+' : '-';
                const durStr = e.duration === 1 ? '1mo' : (e.duration > 1 ? `${e.duration}mo` : 'lifetime');
                eventTextParts.push(`${e.name} (${signStr}${formatInrCurrency(e.amount)}/mo - ${durStr})`);
            }
        });

        const eventText = eventTextParts.length > 0 ? eventTextParts.join(', ') : '-';

        tr.innerHTML = `
            <td><strong>${label}</strong></td>
            <td>Year ${index}</td>
            <td>${index === 0 ? 'Initial Balance' : formatInrCurrency(baseMonthlySavings * 12) + ' / yr'}</td>
            <td>${eventText}</td>
            <td><strong>${formatInrCurrency(wealthData[index])}</strong></td>
        `;

        tbody.appendChild(tr);
    });
}

function switchChartView(mode) {
    currentChartViewMode = mode;

    const btnGraph = document.getElementById('btnGraphView');
    const btnTable = document.getElementById('btnTableView');
    const graphContainer = document.getElementById('graphContainer');
    const tableContainer = document.getElementById('tableContainer');

    if (mode === 'graph') {
        btnGraph.classList.add('active');
        btnTable.classList.remove('active');
        graphContainer.style.display = 'block';
        tableContainer.style.display = 'none';
    } else {
        btnTable.classList.add('active');
        btnGraph.classList.remove('active');
        graphContainer.style.display = 'none';
        tableContainer.style.display = 'block';
    }
}

function toggleTheme() {
    document.body.classList.toggle('theme-dark');
}

function exportReport() {
    window.print();
}

function formatCurrency(amount) {
    return formatInrCurrency(amount);
}