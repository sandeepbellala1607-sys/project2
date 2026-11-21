/**
 * ============================================================================
 * SMART EXPENSE TRACKER - PRODUCTION APPLICATION JAVASCRIPT
 * ============================================================================
 * Production-ready, client-side SPA with HTML5 History API routing,
 * LocalStorage persistence, input validation, and interactive analytics.
 *
 * Supported Routes:
 *   / or /dashboard     -> Dashboard view
 *   /transactions       -> Transactions management & search
 *   /add-transaction    -> Direct action to record transaction
 *   /reports            -> Expense charts & monthly summary
 *   /budget             -> Monthly budget planner
 * ============================================================================
 */

// Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'smart_expense_transactions',
  BUDGETS: 'smart_expense_budgets',
  INITIALIZED: 'smart_expense_app_init'
};

// Available categories categorized by transaction type
const CATEGORIES = {
  expense: [
    'Food',
    'Shopping',
    'Travel',
    'Bills',
    'Health',
    'Education',
    'Entertainment',
    'Other'
  ],
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Other'
  ]
};

// Color palette for category charts and visual accents
const CATEGORY_COLORS = {
  'Food': '#f97316',
  'Shopping': '#ec4899',
  'Travel': '#06b6d4',
  'Bills': '#8b5cf6',
  'Health': '#10b981',
  'Education': '#3b82f6',
  'Entertainment': '#eab308',
  'Salary': '#059669',
  'Freelance': '#10b981',
  'Business': '#2563eb',
  'Investment': '#6366f1',
  'Other': '#64748b'
};

/**
 * Route metadata: titles and canonical paths
 */
const ROUTE_META = {
  'dashboard': {
    title: 'NTSY.AI – Financial Dashboard',
    path: '/dashboard'
  },
  'transactions': {
    title: 'NTSY.AI – All Transactions',
    path: '/transactions'
  },
  'add-transaction': {
    title: 'NTSY.AI – Add Transaction',
    path: '/add-transaction'
  },
  'reports': {
    title: 'NTSY.AI – Reports & Expense Summary',
    path: '/reports'
  },
  'budget': {
    title: 'NTSY.AI – Monthly Budget Planner',
    path: '/budget'
  }
};

/**
 * Default sample data:
 * Total Balance: ₹25,000 | Total Income: ₹40,000 | Total Expenses: ₹15,000 | Count: 18
 */
function getDefaultTransactions() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const makeDate = (day) => `${year}-${month}-${String(day).padStart(2, '0')}`;

  return [
    { id: 'tx-1', type: 'income', amount: 40000, category: 'Salary', description: 'Salary for the month', date: makeDate(1) },
    { id: 'tx-2', type: 'expense', amount: 10000, category: 'Bills', description: 'Rent payment', date: makeDate(2) },
    { id: 'tx-3', type: 'expense', amount: 2500, category: 'Food', description: 'Monthly Groceries', date: makeDate(3) },
    { id: 'tx-4', type: 'expense', amount: 1500, category: 'Travel', description: 'Fuel & Cab charges', date: makeDate(4) },
    { id: 'tx-5', type: 'expense', amount: 150, category: 'Entertainment', description: 'Weekend movie ticket', date: makeDate(5) },
    { id: 'tx-6', type: 'expense', amount: 150, category: 'Shopping', description: 'Household essentials', date: makeDate(6) },
    { id: 'tx-7', type: 'expense', amount: 120, category: 'Health', description: 'First aid & pharmacy', date: makeDate(7) },
    { id: 'tx-8', type: 'expense', amount: 99, category: 'Bills', description: 'Mobile recharge', date: makeDate(8) },
    { id: 'tx-9', type: 'expense', amount: 80, category: 'Food', description: 'Coffee & snacks', date: makeDate(9) },
    { id: 'tx-10', type: 'expense', amount: 80, category: 'Education', description: 'Notebooks & study tools', date: makeDate(10) },
    { id: 'tx-11', type: 'expense', amount: 60, category: 'Food', description: 'Evening snacks', date: makeDate(11) },
    { id: 'tx-12', type: 'expense', amount: 50, category: 'Entertainment', description: 'Music subscription', date: makeDate(12) },
    { id: 'tx-13', type: 'expense', amount: 50, category: 'Food', description: 'Morning breakfast', date: makeDate(13) },
    { id: 'tx-14', type: 'expense', amount: 40, category: 'Travel', description: 'Metro card top-up', date: makeDate(14) },
    { id: 'tx-15', type: 'expense', amount: 40, category: 'Travel', description: 'Auto rickshaw ride', date: makeDate(15) },
    { id: 'tx-16', type: 'expense', amount: 30, category: 'Other', description: 'Stationery items', date: makeDate(16) },
    { id: 'tx-17', type: 'expense', amount: 31, category: 'Other', description: 'Printouts & scanning', date: makeDate(17) },
    { id: 'tx-18', type: 'expense', amount: 20, category: 'Food', description: 'Chai / tea break', date: makeDate(18) }
  ];
}

/**
 * ============================================================================
 * STATE MANAGEMENT
 * ============================================================================
 */
const AppState = {
  transactions: [],
  budgets: {}, // { 'YYYY-MM': amount }
  currentView: 'dashboard',
  selectedMonth: '',
  transactionToDeleteId: null,
  charts: {
    category: null,
    monthly: null
  }
};

/**
 * ============================================================================
 * LOCAL STORAGE HELPERS
 * ============================================================================
 */
function loadStateFromStorage() {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

  if (!isInitialized) {
    // Seed default demo data on very first launch
    const defaultTx = getDefaultTransactions();
    const currentMonthKey = getCurrentMonthKey();
    const defaultBudgets = { [currentMonthKey]: 20000 };

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTx));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(defaultBudgets));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    AppState.transactions = defaultTx;
    AppState.budgets = defaultBudgets;
  } else {
    try {
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      AppState.transactions = storedTx ? JSON.parse(storedTx) : [];
    } catch (e) {
      console.error('Error loading transactions from LocalStorage:', e);
      AppState.transactions = [];
    }

    try {
      const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      AppState.budgets = storedBudgets ? JSON.parse(storedBudgets) : {};
    } catch (e) {
      console.error('Error loading budgets from LocalStorage:', e);
      AppState.budgets = {};
    }
  }

  AppState.selectedMonth = getCurrentMonthKey();
}

function saveTransactionsToStorage() {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(AppState.transactions));
}

function saveBudgetsToStorage() {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(AppState.budgets));
}

/**
 * ============================================================================
 * FORMATTING HELPERS
 * ============================================================================
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getCurrentMonthKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthKey(monthKey) {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ============================================================================
 * TOAST NOTIFICATIONS
 * ============================================================================
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

/**
 * ============================================================================
 * PRODUCTION CLIENT-SIDE ROUTER (HTML5 History API)
 * ============================================================================
 */
function initRouter() {
  // Listen for browser back / forward buttons
  window.addEventListener('popstate', handlePopState);

  // Intercept navigation link clicks for SPA routing
  document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('[data-view]');
    if (!targetLink) return;

    // Allow ctrl+click or middle click to open new tabs normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    const viewName = targetLink.getAttribute('data-view');
    navigateTo(viewName);

    // Close mobile menu if open
    const navMenu = document.getElementById('navMenu');
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
    }
  });

  // Handle initial page load route from URL
  resolveInitialRoute();
}

/**
 * Resolve route on initial load (handles /, /dashboard, /transactions, /add-transaction, /reports, /budget)
 */
function resolveInitialRoute() {
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // Strip trailing slash
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/transactions' || hash === '#/transactions') {
    navigateTo('transactions', false);
  } else if (cleanPath === '/reports' || hash === '#/reports') {
    navigateTo('reports', false);
  } else if (cleanPath === '/budget' || hash === '#/budget') {
    navigateTo('budget', false);
  } else if (cleanPath === '/add-transaction' || hash === '#/add-transaction') {
    navigateTo('dashboard', false);
    openTransactionModal();
  } else {
    // Default to dashboard
    navigateTo('dashboard', false);
  }
}

function handlePopState(e) {
  if (e.state && e.state.view) {
    switchView(e.state.view, false);
  } else {
    resolveInitialRoute();
  }
}

function navigateTo(viewName, pushState = true) {
  const meta = ROUTE_META[viewName] || ROUTE_META['dashboard'];

  if (pushState && window.location.protocol !== 'file:') {
    try {
      window.history.pushState({ view: viewName }, meta.title, meta.path);
    } catch (err) {
      console.warn('History pushState error (e.g. file:// protocol):', err);
    }
  }

  // Update document title for SEO & UX
  document.title = meta.title;

  switchView(viewName);
}

function switchView(viewName) {
  AppState.currentView = viewName;

  // Update navbar active classes
  const navLinks = document.querySelectorAll('.nav-link[data-view]');
  navLinks.forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Switch view section visibility
  const views = document.querySelectorAll('.app-view');
  views.forEach(view => {
    if (view.id === `view-${viewName}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Re-render relevant view
  if (viewName === 'dashboard') {
    renderDashboard();
  } else if (viewName === 'transactions') {
    renderTransactionsTable();
  } else if (viewName === 'reports') {
    renderReportsView();
  } else if (viewName === 'budget') {
    renderBudgetView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * ============================================================================
 * NAVIGATION TOGGLE & DATA SETTINGS MODAL
 * ============================================================================
 */
function initNavigationUI() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Data Settings Modal setup (Demo Data / Clear Data)
  const dataOptionsBtn = document.getElementById('dataOptionsBtn');
  const dataSettingsModal = document.getElementById('dataSettingsModal');
  const dataSettingsCloseBtn = document.getElementById('dataSettingsCloseBtn');
  const dataSettingsDoneBtn = document.getElementById('dataSettingsDoneBtn');
  const loadDemoDataBtn = document.getElementById('loadDemoDataBtn');
  const clearAllDataBtn = document.getElementById('clearAllDataBtn');

  if (dataOptionsBtn && dataSettingsModal) {
    dataOptionsBtn.addEventListener('click', () => {
      dataSettingsModal.classList.add('open');
      dataSettingsModal.setAttribute('aria-hidden', 'false');
    });

    const closeDataModal = () => {
      dataSettingsModal.classList.remove('open');
      dataSettingsModal.setAttribute('aria-hidden', 'true');
    };

    if (dataSettingsCloseBtn) dataSettingsCloseBtn.addEventListener('click', closeDataModal);
    if (dataSettingsDoneBtn) dataSettingsDoneBtn.addEventListener('click', closeDataModal);

    dataSettingsModal.addEventListener('click', (e) => {
      if (e.target === dataSettingsModal) closeDataModal();
    });

    if (loadDemoDataBtn) {
      loadDemoDataBtn.addEventListener('click', () => {
        AppState.transactions = getDefaultTransactions();
        AppState.budgets = { [getCurrentMonthKey()]: 20000 };
        saveTransactionsToStorage();
        saveBudgetsToStorage();
        closeDataModal();
        refreshAllViews();
        showToast('Demo data reloaded successfully!', 'success');
      });
    }

    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all your transactions and budgets? This cannot be undone.')) {
          AppState.transactions = [];
          AppState.budgets = {};
          saveTransactionsToStorage();
          saveBudgetsToStorage();
          closeDataModal();
          refreshAllViews();
          showToast('All data has been cleared. You are ready to record fresh entries.', 'info');
        }
      });
    }
  }
}

/**
 * ============================================================================
 * MODAL DIALOGS (ADD/EDIT & DELETE)
 * ============================================================================
 */
function initModals() {
  const openModalButtons = [
    document.getElementById('openAddModalBtn'),
    document.getElementById('dashAddBtn'),
    document.getElementById('transAddBtn'),
    document.getElementById('emptyStateAddBtn')
  ];

  openModalButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        navigateTo('add-transaction', true);
        openTransactionModal();
      });
    }
  });

  const quickIncomeBtn = document.getElementById('quickAddIncomeBtn');
  if (quickIncomeBtn) {
    quickIncomeBtn.addEventListener('click', () => {
      navigateTo('add-transaction', true);
      openTransactionModal(null, 'income');
    });
  }

  const quickExpenseBtn = document.getElementById('quickAddExpenseBtn');
  if (quickExpenseBtn) {
    quickExpenseBtn.addEventListener('click', () => {
      navigateTo('add-transaction', true);
      openTransactionModal(null, 'expense');
    });
  }

  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const transModal = document.getElementById('transactionModal');

  [modalCloseBtn, modalCancelBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', closeTransactionModal);
    }
  });

  if (transModal) {
    transModal.addEventListener('click', (e) => {
      if (e.target === transModal) closeTransactionModal();
    });
  }

  // Delete modal buttons
  const deleteModal = document.getElementById('deleteModal');
  const deleteCloseBtn = document.getElementById('deleteModalCloseBtn');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

  [deleteCloseBtn, deleteCancelBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', closeDeleteModal);
    }
  });

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', handleConfirmDelete);
  }

  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }

  // Dynamic category update on Transaction Type radio change
  const typeRadios = document.querySelectorAll('input[name="transType"]');
  typeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      populateCategoryDropdown(radio.value);
    });
  });

  // Forms
  const transForm = document.getElementById('transactionForm');
  if (transForm) {
    transForm.addEventListener('submit', handleTransactionSubmit);
  }

  const budgetForm = document.getElementById('budgetForm');
  if (budgetForm) {
    budgetForm.addEventListener('submit', handleBudgetSubmit);
  }
}

function populateCategoryDropdown(type, selectedCategory = '') {
  const categorySelect = document.getElementById('transCategory');
  if (!categorySelect) return;

  const list = CATEGORIES[type] || [];
  categorySelect.innerHTML = '<option value="">Select a Category</option>';

  list.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedCategory) {
      opt.selected = true;
    }
    categorySelect.appendChild(opt);
  });
}

function openTransactionModal(transactionToEdit = null, defaultType = 'expense') {
  const modal = document.getElementById('transactionModal');
  const title = document.getElementById('modalTitle');
  const saveBtn = document.getElementById('saveTransactionBtn');
  const editIdInput = document.getElementById('editTransactionId');
  const amountInput = document.getElementById('transAmount');
  const descInput = document.getElementById('transDescription');
  const dateInput = document.getElementById('transDate');

  clearFormErrors();

  if (transactionToEdit) {
    title.textContent = 'Edit Transaction';
    saveBtn.textContent = 'Update Transaction';
    editIdInput.value = transactionToEdit.id;

    if (transactionToEdit.type === 'income') {
      document.getElementById('typeIncome').checked = true;
    } else {
      document.getElementById('typeExpense').checked = true;
    }

    populateCategoryDropdown(transactionToEdit.type, transactionToEdit.category);

    amountInput.value = transactionToEdit.amount;
    descInput.value = transactionToEdit.description;
    dateInput.value = transactionToEdit.date;
  } else {
    title.textContent = 'Add Transaction';
    saveBtn.textContent = 'Add Transaction';
    editIdInput.value = '';

    if (defaultType === 'income') {
      document.getElementById('typeIncome').checked = true;
    } else {
      document.getElementById('typeExpense').checked = true;
    }

    populateCategoryDropdown(defaultType);

    amountInput.value = '';
    descInput.value = '';

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  amountInput.focus();
}

function closeTransactionModal() {
  const modal = document.getElementById('transactionModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  clearFormErrors();

  // If currently on /add-transaction route, return to dashboard route cleanly
  if (AppState.currentView === 'dashboard' || window.location.pathname.endsWith('/add-transaction')) {
    const meta = ROUTE_META['dashboard'];
    if (window.location.protocol !== 'file:') {
      try {
        window.history.replaceState({ view: 'dashboard' }, meta.title, meta.path);
      } catch (err) {}
    }
    document.title = meta.title;
  }
}

function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-control, .form-select').forEach(el => el.classList.remove('input-error'));
}

/**
 * ============================================================================
 * FORM VALIDATION & TRANSACTION CRUD
 * ============================================================================
 */
function handleTransactionSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const editId = document.getElementById('editTransactionId').value.trim();
  const type = document.querySelector('input[name="transType"]:checked').value;
  const amountStr = document.getElementById('transAmount').value.trim();
  const category = document.getElementById('transCategory').value.trim();
  const description = document.getElementById('transDescription').value.trim();
  const date = document.getElementById('transDate').value.trim();

  let hasError = false;

  // 1. Amount validation (> 0)
  const amount = parseFloat(amountStr);
  if (!amountStr || isNaN(amount) || amount <= 0) {
    document.getElementById('amountError').textContent = 'Please enter a valid amount greater than ₹0.';
    document.getElementById('transAmount').classList.add('input-error');
    hasError = true;
  }

  // 2. Category validation
  if (!category) {
    document.getElementById('categoryError').textContent = 'Please select a category.';
    document.getElementById('transCategory').classList.add('input-error');
    hasError = true;
  }

  // 3. Description validation
  if (!description) {
    document.getElementById('descriptionError').textContent = 'Please provide a brief description.';
    document.getElementById('transDescription').classList.add('input-error');
    hasError = true;
  }

  // 4. Date validation
  if (!date) {
    document.getElementById('dateError').textContent = 'Please select a date.';
    document.getElementById('transDate').classList.add('input-error');
    hasError = true;
  }

  if (hasError) return;

  if (editId) {
    // Update existing transaction
    const index = AppState.transactions.findIndex(t => t.id === editId);
    if (index !== -1) {
      AppState.transactions[index] = {
        ...AppState.transactions[index],
        type,
        amount,
        category,
        description,
        date
      };
      saveTransactionsToStorage();
      showToast('Transaction updated successfully!', 'success');
    }
  } else {
    // Create new transaction
    const newTransaction = {
      id: 'tx-' + Date.now(),
      type,
      amount,
      category,
      description,
      date
    };
    AppState.transactions.unshift(newTransaction);
    saveTransactionsToStorage();
    showToast('Transaction added successfully!', 'success');
  }

  closeTransactionModal();
  refreshAllViews();
}

function openDeleteModal(transactionId) {
  const transaction = AppState.transactions.find(t => t.id === transactionId);
  if (!transaction) return;

  AppState.transactionToDeleteId = transactionId;
  const preview = document.getElementById('deletePreviewInfo');
  const typeBadgeClass = transaction.type === 'income' ? 'text-success' : 'text-danger';

  preview.innerHTML = `
    <div><strong>Description:</strong> ${escapeHtml(transaction.description)}</div>
    <div><strong>Category:</strong> ${escapeHtml(transaction.category)}</div>
    <div><strong>Amount:</strong> <span class="${typeBadgeClass}">${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}</span></div>
    <div><strong>Date:</strong> ${formatDate(transaction.date)}</div>
  `;

  const modal = document.getElementById('deleteModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  AppState.transactionToDeleteId = null;
}

function handleConfirmDelete() {
  if (!AppState.transactionToDeleteId) return;

  const id = AppState.transactionToDeleteId;
  AppState.transactions = AppState.transactions.filter(t => t.id !== id);
  saveTransactionsToStorage();

  closeDeleteModal();
  showToast('Transaction deleted successfully', 'danger');
  refreshAllViews();
}

/**
 * ============================================================================
 * DASHBOARD VIEW
 * ============================================================================
 */
function renderDashboard() {
  let totalIncome = 0;
  let totalExpenses = 0;

  AppState.transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }
  });

  const totalBalance = totalIncome - totalExpenses;
  const totalCount = AppState.transactions.length;

  const balanceEl = document.getElementById('dashTotalBalance');
  const incomeEl = document.getElementById('dashTotalIncome');
  const expenseEl = document.getElementById('dashTotalExpenses');
  const countEl = document.getElementById('dashTotalCount');

  if (balanceEl) balanceEl.textContent = formatCurrency(totalBalance);
  if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
  if (expenseEl) expenseEl.textContent = formatCurrency(totalExpenses);
  if (countEl) countEl.textContent = totalCount;

  renderDashboardBudgetPreview();
  renderDashboardRecentTransactions();
}

function renderDashboardBudgetPreview() {
  const currentMonthKey = getCurrentMonthKey();
  const monthName = formatMonthKey(currentMonthKey);
  const budgetMonthNameEl = document.getElementById('dashBudgetMonthName');
  if (budgetMonthNameEl) budgetMonthNameEl.textContent = monthName;

  const budget = AppState.budgets[currentMonthKey] || 0;

  let currentMonthSpent = 0;
  AppState.transactions.forEach(t => {
    if (t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey)) {
      currentMonthSpent += t.amount;
    }
  });

  const remaining = Math.max(0, budget - currentMonthSpent);
  const percentage = budget > 0 ? Math.min(100, Math.round((currentMonthSpent / budget) * 100)) : 0;

  document.getElementById('dashBudgetTotal').textContent = formatCurrency(budget);
  document.getElementById('dashBudgetSpent').textContent = formatCurrency(currentMonthSpent);
  document.getElementById('dashBudgetRemaining').textContent = formatCurrency(remaining);

  const progressBar = document.getElementById('dashBudgetProgressBar');
  const percentText = document.getElementById('dashBudgetPercent');
  const alertBadge = document.getElementById('dashBudgetAlertBadge');

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, percentage)}%`;
    progressBar.className = 'progress-bar';

    if (budget === 0) {
      alertBadge.textContent = 'No Budget Set';
      alertBadge.className = 'badge badge-category';
    } else if (currentMonthSpent > budget) {
      progressBar.classList.add('danger');
      alertBadge.textContent = 'Exceeded!';
      alertBadge.className = 'badge badge-expense';
    } else if (percentage >= 80) {
      progressBar.classList.add('warning');
      alertBadge.textContent = 'Near Limit';
      alertBadge.className = 'badge';
      alertBadge.style.backgroundColor = '#fffbeb';
      alertBadge.style.color = '#b45309';
    } else {
      alertBadge.textContent = 'On Track';
      alertBadge.className = 'badge badge-income';
    }
  }

  if (percentText) {
    percentText.textContent = budget > 0 ? `${percentage}% spent` : 'Set a budget to track';
  }
}

function renderDashboardRecentTransactions() {
  const listEl = document.getElementById('dashRecentList');
  if (!listEl) return;

  const sorted = [...AppState.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 4);

  if (recent.length === 0) {
    listEl.innerHTML = `
      <div style="padding: 32px 20px; text-align: center; color: var(--text-muted);">
        <p>No transactions yet. Add your first transaction to start tracking your expenses.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = recent.map(t => {
    const isIncome = t.type === 'income';
    const amountSign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-success' : 'text-danger';
    const iconClass = isIncome ? 'income' : 'expense';
    const iconSvg = isIncome
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`;

    return `
      <div class="recent-item">
        <div class="recent-item-info">
          <div class="recent-item-icon ${iconClass}">
            ${iconSvg}
          </div>
          <div class="recent-item-details">
            <span class="recent-item-title">${escapeHtml(t.description)}</span>
            <div class="recent-item-meta">
              <span class="badge badge-category">${escapeHtml(t.category)}</span>
              <span>•</span>
              <span>${formatDate(t.date)}</span>
            </div>
          </div>
        </div>
        <div class="recent-item-amount ${amountClass}">
          ${amountSign}${formatCurrency(t.amount)}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * ============================================================================
 * TRANSACTIONS VIEW (LIST, SEARCH & FILTERS)
 * ============================================================================
 */
function initTransactionFilters() {
  const searchInput = document.getElementById('filterSearch');
  const typeSelect = document.getElementById('filterType');
  const categorySelect = document.getElementById('filterCategory');
  const dateFromInput = document.getElementById('filterDateFrom');
  const dateToInput = document.getElementById('filterDateTo');
  const resetBtn = document.getElementById('filterResetBtn');

  updateFilterCategoryOptions();

  [searchInput, typeSelect, categorySelect, dateFromInput, dateToInput].forEach(elem => {
    if (elem) {
      elem.addEventListener('input', () => renderTransactionsTable());
      elem.addEventListener('change', () => renderTransactionsTable());
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (typeSelect) typeSelect.value = 'all';
      if (categorySelect) categorySelect.value = 'all';
      if (dateFromInput) dateFromInput.value = '';
      if (dateToInput) dateToInput.value = '';
      renderTransactionsTable();
      showToast('Filters reset', 'info');
    });
  }
}

function updateFilterCategoryOptions() {
  const select = document.getElementById('filterCategory');
  if (!select) return;

  const currentSelection = select.value;
  const allCategories = Array.from(new Set([...CATEGORIES.expense, ...CATEGORIES.income])).sort();

  select.innerHTML = '<option value="all">All Categories</option>';
  allCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });
}

function getFilteredTransactions() {
  const search = (document.getElementById('filterSearch')?.value || '').toLowerCase().trim();
  const type = document.getElementById('filterType')?.value || 'all';
  const category = document.getElementById('filterCategory')?.value || 'all';
  const dateFrom = document.getElementById('filterDateFrom')?.value || '';
  const dateTo = document.getElementById('filterDateTo')?.value || '';

  return AppState.transactions.filter(t => {
    if (search && !t.description.toLowerCase().includes(search)) {
      return false;
    }
    if (type !== 'all' && t.type !== type) {
      return false;
    }
    if (category !== 'all' && t.category !== category) {
      return false;
    }
    if (dateFrom && t.date < dateFrom) {
      return false;
    }
    if (dateTo && t.date > dateTo) {
      return false;
    }
    return true;
  });
}

function renderTransactionsTable() {
  const tableBody = document.getElementById('transactionTableBody');
  const emptyState = document.getElementById('transactionEmptyState');
  const tableWrapper = document.querySelector('.table-responsive');
  const countLabel = document.getElementById('filterResultCount');

  const filtered = getFilteredTransactions();
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} of ${AppState.transactions.length} transactions`;
  }

  if (filtered.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = filtered.map(t => {
    const isIncome = t.type === 'income';
    const amountSign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-success' : 'text-danger';
    const typeBadgeClass = isIncome ? 'badge-income' : 'badge-expense';

    return `
      <tr data-id="${t.id}">
        <td data-label="Date">${formatDate(t.date)}</td>
        <td data-label="Description">
          <strong>${escapeHtml(t.description)}</strong>
        </td>
        <td data-label="Category">
          <span class="badge badge-category">${escapeHtml(t.category)}</span>
        </td>
        <td data-label="Type">
          <span class="badge ${typeBadgeClass}">${t.type}</span>
        </td>
        <td data-label="Amount" class="text-right cell-amount ${amountClass}">
          ${amountSign}${formatCurrency(t.amount)}
        </td>
        <td data-label="Actions" class="text-center cell-actions">
          <div class="table-actions">
            <button class="btn-icon edit-btn" title="Edit transaction" onclick="handleEditClick('${t.id}')">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon delete-btn" title="Delete transaction" onclick="handleDeleteClick('${t.id}')">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.handleEditClick = function(id) {
  const transaction = AppState.transactions.find(t => t.id === id);
  if (transaction) {
    openTransactionModal(transaction);
  }
};

window.handleDeleteClick = function(id) {
  openDeleteModal(id);
};

/**
 * ============================================================================
 * REPORTS & CHARTS VIEW
 * ============================================================================
 */
function initReportsMonthSelector() {
  const selector = document.getElementById('reportMonthSelect');
  if (!selector) return;

  const monthsSet = new Set();
  monthsSet.add(getCurrentMonthKey());

  AppState.transactions.forEach(t => {
    if (t.date && t.date.length >= 7) {
      monthsSet.add(t.date.substring(0, 7));
    }
  });

  const sortedMonths = Array.from(monthsSet).sort().reverse();

  selector.innerHTML = '';
  sortedMonths.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = formatMonthKey(m);
    if (m === AppState.selectedMonth) opt.selected = true;
    selector.appendChild(opt);
  });

  selector.addEventListener('change', () => {
    AppState.selectedMonth = selector.value;
    renderReportsView();
  });
}

function renderReportsView() {
  initReportsMonthSelector();

  const currentMonth = AppState.selectedMonth || getCurrentMonthKey();

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  const categoryTotals = {};

  AppState.transactions.forEach(t => {
    if (t.date && t.date.startsWith(currentMonth)) {
      if (t.type === 'income') {
        monthlyIncome += t.amount;
      } else {
        monthlyExpenses += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    }
  });

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  let topCategory = '—';
  let maxSpent = 0;
  for (const [cat, spent] of Object.entries(categoryTotals)) {
    if (spent > maxSpent) {
      maxSpent = spent;
      topCategory = `${cat} (${formatCurrency(spent)})`;
    }
  }

  document.getElementById('reportMonthlyIncome').textContent = formatCurrency(monthlyIncome);
  document.getElementById('reportMonthlyExpenses').textContent = formatCurrency(monthlyExpenses);
  document.getElementById('reportMonthlyBalance').textContent = formatCurrency(monthlyBalance);
  document.getElementById('reportTopCategory').textContent = topCategory;

  renderCategoryExpenseChart();
  renderMonthlyComparisonChart();
}

function renderCategoryExpenseChart() {
  const currentMonth = AppState.selectedMonth || getCurrentMonthKey();
  const categoryTotals = {};
  let totalSpent = 0;

  AppState.transactions.forEach(t => {
    if (t.type === 'expense' && t.date && t.date.startsWith(currentMonth)) {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      totalSpent += t.amount;
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const colors = labels.map(label => CATEGORY_COLORS[label] || '#94a3b8');

  const listEl = document.getElementById('categoryBreakdownList');
  if (listEl) {
    if (labels.length === 0) {
      listEl.innerHTML = `<p class="text-center text-muted" style="padding: 12px 0;">No expense records for this month.</p>`;
    } else {
      listEl.innerHTML = labels.map((cat, i) => {
        const amount = data[i];
        const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
        const color = colors[i];
        return `
          <div class="cat-item-row">
            <div class="cat-item-left">
              <span class="cat-color-dot" style="background-color: ${color}"></span>
              <strong>${escapeHtml(cat)}</strong>
            </div>
            <div class="cat-item-right">
              <span>${formatCurrency(amount)}</span>
              <span class="cat-percent">${percent}%</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;

  if (window.Chart) {
    if (AppState.charts.category) {
      AppState.charts.category.destroy();
    }

    if (labels.length === 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    AppState.charts.category = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { family: "'Inter', sans-serif", size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const val = context.parsed;
                const pct = totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  } else {
    drawCanvasPieFallback(canvas, labels, data, colors, totalSpent);
  }
}

function drawCanvasPieFallback(canvas, labels, data, colors, totalSpent) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (data.length === 0 || totalSpent === 0) {
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('No expense data to display', canvas.width / 2, canvas.height / 2);
    return;
  }

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;
  let startAngle = 0;

  for (let i = 0; i < data.length; i++) {
    const sliceAngle = (data[i] / totalSpent) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += sliceAngle;
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.55, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

function renderMonthlyComparisonChart() {
  const canvas = document.getElementById('monthlyComparisonChart');
  if (!canvas) return;

  const monthlyData = {};

  AppState.transactions.forEach(t => {
    if (t.date && t.date.length >= 7) {
      const monthKey = t.date.substring(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expense += t.amount;
      }
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
  if (sortedMonths.length === 0) {
    sortedMonths.push(getCurrentMonthKey());
    monthlyData[getCurrentMonthKey()] = { income: 0, expense: 0 };
  }

  const monthLabels = sortedMonths.map(m => {
    const parts = m.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return d.toLocaleDateString('en-IN', { month: 'short' });
  });

  const incomeDataset = sortedMonths.map(m => monthlyData[m]?.income || 0);
  const expenseDataset = sortedMonths.map(m => monthlyData[m]?.expense || 0);

  if (window.Chart) {
    if (AppState.charts.monthly) {
      AppState.charts.monthly.destroy();
    }

    AppState.charts.monthly = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: 'Income',
            data: incomeDataset,
            backgroundColor: '#10b981',
            borderRadius: 6
          },
          {
            label: 'Expense',
            data: expenseDataset,
            backgroundColor: '#ef4444',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: "'Inter', sans-serif" } }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN');
              }
            }
          }
        }
      }
    });
  }
}

/**
 * ============================================================================
 * BUDGET VIEW
 * ============================================================================
 */
function renderBudgetView() {
  const monthInput = document.getElementById('budgetMonth');
  const amountInput = document.getElementById('budgetAmount');
  const activeMonthLabel = document.getElementById('budgetActiveMonthLabel');

  const targetMonth = monthInput?.value || getCurrentMonthKey();
  if (monthInput && !monthInput.value) {
    monthInput.value = targetMonth;
  }

  if (activeMonthLabel) {
    activeMonthLabel.textContent = formatMonthKey(targetMonth);
  }

  const currentBudget = AppState.budgets[targetMonth] || 0;
  if (amountInput && !amountInput.value) {
    amountInput.value = currentBudget > 0 ? currentBudget : '';
  }

  let actualSpent = 0;
  AppState.transactions.forEach(t => {
    if (t.type === 'expense' && t.date && t.date.startsWith(targetMonth)) {
      actualSpent += t.amount;
    }
  });

  const remaining = Math.max(0, currentBudget - actualSpent);
  const percentage = currentBudget > 0 ? Math.round((actualSpent / currentBudget) * 100) : 0;

  document.getElementById('viewBudgetTotal').textContent = formatCurrency(currentBudget);
  document.getElementById('viewBudgetSpent').textContent = formatCurrency(actualSpent);
  document.getElementById('viewBudgetRemaining').textContent = formatCurrency(remaining);
  document.getElementById('viewBudgetPercentText').textContent = currentBudget > 0 ? `${percentage}%` : '0%';

  const progressBar = document.getElementById('viewBudgetProgressBar');
  const banner = document.getElementById('budgetAlertBanner');
  const bannerTitle = document.getElementById('budgetAlertTitle');
  const bannerMsg = document.getElementById('budgetAlertMessage');

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, percentage)}%`;
    progressBar.className = 'progress-bar';

    if (currentBudget === 0) {
      banner.className = 'budget-alert-banner alert-warning';
      bannerTitle.textContent = 'No budget set for this month';
      bannerMsg.textContent = 'Use the form on the left to set a monthly spending target.';
    } else if (actualSpent > currentBudget) {
      progressBar.classList.add('danger');
      banner.className = 'budget-alert-banner alert-danger';
      bannerTitle.textContent = 'Warning: Budget Exceeded!';
      bannerMsg.textContent = `You have exceeded your monthly limit by ${formatCurrency(actualSpent - currentBudget)}. Please review your expenses.`;
    } else if (percentage >= 80) {
      progressBar.classList.add('warning');
      banner.className = 'budget-alert-banner alert-warning';
      bannerTitle.textContent = 'Attention: Near Budget Limit';
      bannerMsg.textContent = `You have spent ${percentage}% of your budget with ${formatCurrency(remaining)} remaining.`;
    } else {
      banner.className = 'budget-alert-banner alert-success';
      bannerTitle.textContent = 'Expenses within budget';
      bannerMsg.textContent = `Great job! You have used ${percentage}% of your budget and have ${formatCurrency(remaining)} remaining.`;
    }
  }

  if (monthInput) {
    monthInput.onchange = () => {
      amountInput.value = AppState.budgets[monthInput.value] || '';
      renderBudgetView();
    };
  }
}

function handleBudgetSubmit(e) {
  e.preventDefault();
  const monthInput = document.getElementById('budgetMonth');
  const amountInput = document.getElementById('budgetAmount');
  const errorEl = document.getElementById('budgetAmountError');

  errorEl.textContent = '';
  amountInput.classList.remove('input-error');

  const month = monthInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!month) {
    errorEl.textContent = 'Please choose a month.';
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    errorEl.textContent = 'Please enter a valid budget amount greater than ₹0.';
    amountInput.classList.add('input-error');
    return;
  }

  AppState.budgets[month] = amount;
  saveBudgetsToStorage();

  showToast(`Budget of ${formatCurrency(amount)} saved for ${formatMonthKey(month)}!`, 'success');
  renderBudgetView();
  renderDashboardBudgetPreview();
}

/**
 * ============================================================================
 * VIEW REFRESH & BOOTSTRAP
 * ============================================================================
 */
function refreshAllViews() {
  updateFilterCategoryOptions();
  renderDashboard();
  renderTransactionsTable();
  renderReportsView();
  renderBudgetView();
}

document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  initNavigationUI();
  initModals();
  initTransactionFilters();
  initRouter();
  refreshAllViews();
});
