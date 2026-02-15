// === GapCap Invoice Tracker - Main App ===

(function () {
  'use strict';

  // --- Default Settings ---
  const DEFAULT_SETTINGS = {
    name: 'John Bierer',
    address: '1990 West 51st Street',
    cityStateZip: 'Erie, PA 16509',
    phone: '',
    email: 'johnathan.bierer@gmail.com',
    billCompany: 'GapCapUSA',
    billAttention: '',
    billAddress: '',
    billCityStateZip: '',
    billEmail: '',
    rate: 30.00,
    description: 'GapCap Display Demo Kit',
    terms: 'Due on Receipt',
    nextInvoice: 1
  };

  // --- Storage Helpers ---
  function loadSettings() {
    const stored = localStorage.getItem('gapcap_settings');
    if (stored) {
      return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(stored));
    }
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  function saveSettings(settings) {
    localStorage.setItem('gapcap_settings', JSON.stringify(settings));
  }

  function loadInvoices() {
    const stored = localStorage.getItem('gapcap_invoices');
    return stored ? JSON.parse(stored) : [];
  }

  function saveInvoices(invoices) {
    localStorage.setItem('gapcap_invoices', JSON.stringify(invoices));
  }

  // --- State ---
  let settings = loadSettings();
  let invoices = loadInvoices();

  // --- DOM References ---
  const pages = document.querySelectorAll('.page');
  const navBtns = document.querySelectorAll('.nav-btn');

  // Tracker
  const invoiceList = document.getElementById('invoice-list');
  const emptyState = document.getElementById('empty-state');
  const statKits = document.getElementById('stat-kits');
  const statInvoiced = document.getElementById('stat-invoiced');
  const statPaid = document.getElementById('stat-paid');
  const statOutstanding = document.getElementById('stat-outstanding');

  // Invoice form
  const invoiceForm = document.getElementById('invoice-form');
  const invNumber = document.getElementById('inv-number');
  const invDate = document.getElementById('inv-date');
  const invDescription = document.getElementById('inv-description');
  const invKits = document.getElementById('inv-kits');
  const invRate = document.getElementById('inv-rate');
  const invTotal = document.getElementById('inv-total');
  const invHowSent = document.getElementById('inv-how-sent');
  const invDatePaid = document.getElementById('inv-date-paid');
  const invNotes = document.getElementById('inv-notes');
  const editInvoiceId = document.getElementById('edit-invoice-id');
  const invoiceFormTitle = document.getElementById('invoice-form-title');
  const btnSaveInvoice = document.getElementById('btn-save-invoice');
  const btnPreviewInvoice = document.getElementById('btn-preview-invoice');

  // Settings form
  const settingsForm = document.getElementById('settings-form');

  // Preview modal
  const previewModal = document.getElementById('invoice-preview-modal');
  const invoicePreview = document.getElementById('invoice-preview');
  const btnClosePreview = document.getElementById('btn-close-preview');
  const btnPrint = document.getElementById('btn-print');
  const btnEmailInvoice = document.getElementById('btn-email-invoice');

  // Edit modal
  const editModal = document.getElementById('edit-modal');
  const editTrackerForm = document.getElementById('edit-tracker-form');
  const editTrackerId = document.getElementById('edit-tracker-id');
  const editModalTitle = document.getElementById('edit-modal-title');
  const editHowSent = document.getElementById('edit-how-sent');
  const editDatePaid = document.getElementById('edit-date-paid');
  const editNotes = document.getElementById('edit-notes');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');
  const btnDeleteInvoice = document.getElementById('btn-delete-invoice');

  // Toast
  const toast = document.getElementById('toast');

  // --- Utility ---
  function formatCurrency(amount) {
    return '$' + Number(amount).toFixed(2);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts[1] + '/' + parts[2] + '/' + parts[0];
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.add('hidden');
    }, 2500);
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // --- Navigation ---
  function switchPage(pageName) {
    pages.forEach(function (p) { p.classList.remove('active'); });
    navBtns.forEach(function (b) { b.classList.remove('active'); });

    document.getElementById('page-' + pageName).classList.add('active');
    document.querySelector('[data-page="' + pageName + '"]').classList.add('active');

    if (pageName === 'new-invoice') {
      prepareNewInvoiceForm();
    } else if (pageName === 'settings') {
      populateSettingsForm();
    } else if (pageName === 'tracker') {
      renderTracker();
    }
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchPage(btn.dataset.page);
    });
  });

  // --- Settings ---
  function populateSettingsForm() {
    document.getElementById('set-name').value = settings.name;
    document.getElementById('set-address').value = settings.address;
    document.getElementById('set-city-state-zip').value = settings.cityStateZip;
    document.getElementById('set-phone').value = settings.phone;
    document.getElementById('set-email').value = settings.email;
    document.getElementById('set-bill-company').value = settings.billCompany;
    document.getElementById('set-bill-attention').value = settings.billAttention;
    document.getElementById('set-bill-address').value = settings.billAddress;
    document.getElementById('set-bill-city-state-zip').value = settings.billCityStateZip;
    document.getElementById('set-bill-email').value = settings.billEmail;
    document.getElementById('set-rate').value = settings.rate;
    document.getElementById('set-description').value = settings.description;
    document.getElementById('set-terms').value = settings.terms;
    document.getElementById('set-next-invoice').value = settings.nextInvoice;
  }

  settingsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    settings.name = document.getElementById('set-name').value.trim();
    settings.address = document.getElementById('set-address').value.trim();
    settings.cityStateZip = document.getElementById('set-city-state-zip').value.trim();
    settings.phone = document.getElementById('set-phone').value.trim();
    settings.email = document.getElementById('set-email').value.trim();
    settings.billCompany = document.getElementById('set-bill-company').value.trim();
    settings.billAttention = document.getElementById('set-bill-attention').value.trim();
    settings.billAddress = document.getElementById('set-bill-address').value.trim();
    settings.billCityStateZip = document.getElementById('set-bill-city-state-zip').value.trim();
    settings.billEmail = document.getElementById('set-bill-email').value.trim();
    settings.rate = parseFloat(document.getElementById('set-rate').value) || 30;
    settings.description = document.getElementById('set-description').value.trim();
    settings.terms = document.getElementById('set-terms').value.trim();
    settings.nextInvoice = parseInt(document.getElementById('set-next-invoice').value) || 1;
    saveSettings(settings);
    showToast('Settings saved!');
  });

  // --- New Invoice Form ---
  function prepareNewInvoiceForm() {
    editInvoiceId.value = '';
    invoiceFormTitle.textContent = 'New Invoice';
    btnSaveInvoice.textContent = 'Save Invoice';
    invNumber.value = settings.nextInvoice;
    invDate.value = new Date().toISOString().split('T')[0];
    invDescription.value = settings.description;
    invRate.value = formatCurrency(settings.rate);
    invKits.value = '';
    invTotal.textContent = '$0.00';
    invHowSent.value = '';
    invDatePaid.value = '';
    invNotes.value = '';
    invNumber.readOnly = false;

    // Hide delete button (only show when editing)
    document.getElementById('edit-mode-actions').classList.add('hidden');

    // Show send info
    updateFormSendInfo();
  }

  function updateFormSendInfo() {
    var sendInfo = document.getElementById('send-info-from-form');
    if (settings.billEmail) {
      sendInfo.innerHTML = 'Email will send to: <strong>' + escHtml(settings.billEmail) + '</strong>';
    } else {
      sendInfo.innerHTML = '<span class="warning">No Bill To email set — go to Settings to add one</span>';
    }
  }

  // Load an existing invoice into the form for editing
  function loadInvoiceForEditing(invoiceId) {
    var inv = invoices.find(function (i) { return i.id === invoiceId; });
    if (!inv) return;

    editInvoiceId.value = inv.id;
    invoiceFormTitle.textContent = 'Edit Invoice #' + inv.number;
    btnSaveInvoice.textContent = 'Update Invoice';
    invNumber.value = inv.number;
    invDate.value = inv.date;
    invDescription.value = inv.description || settings.description;
    invRate.value = formatCurrency(inv.rate);
    invKits.value = inv.kits;
    invTotal.textContent = formatCurrency(inv.total);
    invHowSent.value = inv.howSent || '';
    invDatePaid.value = inv.datePaid || '';
    invNotes.value = inv.notes || '';
    invNumber.readOnly = false;

    // Show delete button when editing
    document.getElementById('edit-mode-actions').classList.remove('hidden');

    updateFormSendInfo();

    // Switch to the invoice form page
    pages.forEach(function (p) { p.classList.remove('active'); });
    navBtns.forEach(function (b) { b.classList.remove('active'); });
    document.getElementById('page-new-invoice').classList.add('active');
    document.querySelector('[data-page="new-invoice"]').classList.add('active');
  }

  // Helper: build invoice message text from current form
  function getInvoiceMessageText() {
    var kits = parseInt(invKits.value) || 0;
    var invNum = invNumber.value;
    var total = formatCurrency(kits * settings.rate);

    return 'Invoice #' + invNum + ' from ' + settings.name + '\n\n' +
      'Description: ' + (invDescription.value || settings.description) + '\n' +
      'Number of Kits: ' + kits + '\n' +
      'Rate: ' + formatCurrency(settings.rate) + ' per kit\n' +
      'Total Due: ' + total + '\n\n' +
      'Payment Terms: ' + settings.terms + '\n\n' +
      'Please make checks payable to ' + settings.name + ' or send payment via email to ' + settings.email + '.\n\n' +
      'Thank you!\n' + settings.name;
  }

  // Email Invoice from form page
  document.getElementById('btn-email-from-form').addEventListener('click', function () {
    var kits = parseInt(invKits.value) || 0;
    if (!kits || kits < 1) {
      showToast('Enter the number of kits first');
      invKits.focus();
      return;
    }

    var recipient = settings.billEmail || '';
    if (!recipient) {
      showToast('Set a Bill To email in Settings first!');
      return;
    }

    var invNum = invNumber.value;
    var total = formatCurrency(kits * settings.rate);
    var subject = encodeURIComponent('Invoice #' + invNum + ' from ' + settings.name + ' - ' + total);
    var body = encodeURIComponent(getInvoiceMessageText());

    var gmailUrl = 'https://mail.google.com/mail/?view=cm&to=' + encodeURIComponent(recipient) + '&su=' + subject + '&body=' + body;
    var mailtoUrl = 'mailto:' + encodeURIComponent(recipient) + '?subject=' + subject + '&body=' + body;

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = mailtoUrl;
    } else {
      window.open(gmailUrl, '_blank');
    }
    showToast('Opening email to ' + recipient);
  });

  // Text Invoice from form page
  document.getElementById('btn-text-from-form').addEventListener('click', function () {
    var kits = parseInt(invKits.value) || 0;
    if (!kits || kits < 1) {
      showToast('Enter the number of kits first');
      invKits.focus();
      return;
    }

    var message = encodeURIComponent(getInvoiceMessageText());

    // sms: works on both iPhone and Android
    // iPhone uses &body=, Android uses ?body=
    var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    var smsUrl = isIOS ? 'sms:&body=' + message : 'sms:?body=' + message;

    window.location.href = smsUrl;
    showToast('Opening text message...');
  });

  // --- Share Invoice as Image ---
  // Creates the invoice image and uses Web Share API or fallback download
  function generateInvoiceImage(callback) {
    // First make sure the preview is rendered (even if hidden)
    var kits = parseInt(invKits.value) || 0;
    if (!kits || kits < 1) {
      showToast('Enter the number of kits first');
      invKits.focus();
      return;
    }

    var data = {
      number: parseInt(invNumber.value),
      date: invDate.value,
      description: invDescription.value || settings.description,
      kits: kits,
      rate: settings.rate,
      total: kits * settings.rate
    };

    // Render the preview into the hidden element
    renderInvoicePreview(data);

    // We need the preview visible for html2canvas to work
    var previewEl = document.getElementById('invoice-preview');
    var modal = document.getElementById('invoice-preview-modal');
    var wasHidden = modal.classList.contains('hidden');

    // Temporarily show if hidden (off-screen trick)
    if (wasHidden) {
      modal.style.position = 'fixed';
      modal.style.left = '-9999px';
      modal.classList.remove('hidden');
    }

    showToast('Creating invoice image...');

    html2canvas(previewEl, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    }).then(function (canvas) {
      // Restore modal state
      if (wasHidden) {
        modal.classList.add('hidden');
        modal.style.position = '';
        modal.style.left = '';
      }

      canvas.toBlob(function (blob) {
        var fileName = 'Invoice-' + data.number + '-' + settings.name.replace(/\s/g, '-') + '.png';
        var file = new File([blob], fileName, { type: 'image/png' });
        callback(file, blob, fileName, data);
      }, 'image/png');
    }).catch(function (err) {
      if (wasHidden) {
        modal.classList.add('hidden');
        modal.style.position = '';
        modal.style.left = '';
      }
      showToast('Error creating image. Try Print instead.');
    });
  }

  function shareInvoiceImage() {
    generateInvoiceImage(function (file, blob, fileName, data) {
      // Try Web Share API first (works on phones)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          title: 'Invoice #' + data.number,
          text: 'Invoice #' + data.number + ' from ' + settings.name + ' - ' + formatCurrency(data.total),
          files: [file]
        }).then(function () {
          showToast('Invoice shared!');
        }).catch(function (err) {
          if (err.name !== 'AbortError') {
            // User cancelled, that's fine
            downloadInvoiceBlob(blob, fileName);
          }
        });
      } else {
        // Fallback: download the image
        downloadInvoiceBlob(blob, fileName);
      }
    });
  }

  function downloadInvoiceBlob(blob, fileName) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Invoice image downloaded!');
  }

  // Share from the invoice form page
  document.getElementById('btn-share-from-form').addEventListener('click', function () {
    shareInvoiceImage();
  });

  // Share from the preview modal
  document.getElementById('btn-share-preview').addEventListener('click', function () {
    var previewEl = document.getElementById('invoice-preview');

    showToast('Creating invoice image...');

    html2canvas(previewEl, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false
    }).then(function (canvas) {
      canvas.toBlob(function (blob) {
        var invNum = currentPreviewData ? currentPreviewData.number : 'X';
        var fileName = 'Invoice-' + invNum + '-' + settings.name.replace(/\s/g, '-') + '.png';
        var file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            title: 'Invoice #' + invNum,
            text: 'Invoice #' + invNum + ' from ' + settings.name + ' - ' + (currentPreviewData ? formatCurrency(currentPreviewData.total) : ''),
            files: [file]
          }).then(function () {
            showToast('Invoice shared!');
          }).catch(function (err) {
            if (err.name !== 'AbortError') {
              downloadInvoiceBlob(blob, fileName);
            }
          });
        } else {
          downloadInvoiceBlob(blob, fileName);
        }
      }, 'image/png');
    }).catch(function () {
      showToast('Error creating image. Try Print instead.');
    });
  });

  // Delete invoice from the edit form
  document.getElementById('btn-delete-from-form').addEventListener('click', function () {
    var id = editInvoiceId.value;
    if (!id) return;
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    invoices = invoices.filter(function (i) { return i.id !== id; });
    saveInvoices(invoices);
    showToast('Invoice deleted');
    switchPage('tracker');
  });

  // Calculate total on kit count change
  invKits.addEventListener('input', function () {
    var kits = parseInt(invKits.value) || 0;
    invTotal.textContent = formatCurrency(kits * settings.rate);
  });

  // Save invoice
  invoiceForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var kits = parseInt(invKits.value);
    if (!kits || kits < 1) {
      showToast('Enter the number of kits');
      invKits.focus();
      return;
    }

    var editId = editInvoiceId.value;
    var invoiceData = {
      id: editId || generateId(),
      number: parseInt(invNumber.value),
      date: invDate.value,
      description: invDescription.value || settings.description,
      kits: kits,
      rate: settings.rate,
      total: kits * settings.rate,
      howSent: invHowSent.value,
      datePaid: invDatePaid.value,
      notes: invNotes.value.trim()
    };

    if (editId) {
      // Update existing
      var idx = invoices.findIndex(function (inv) { return inv.id === editId; });
      if (idx !== -1) {
        invoices[idx] = invoiceData;
      }
      showToast('Invoice updated!');
    } else {
      // New invoice
      invoices.push(invoiceData);
      // Auto-increment next invoice number
      settings.nextInvoice = invoiceData.number + 1;
      saveSettings(settings);
      showToast('Invoice saved!');
    }

    saveInvoices(invoices);
    switchPage('tracker');
  });

  // Preview invoice
  btnPreviewInvoice.addEventListener('click', function () {
    var kits = parseInt(invKits.value);
    if (!kits || kits < 1) {
      showToast('Enter the number of kits first');
      invKits.focus();
      return;
    }

    var data = {
      number: parseInt(invNumber.value),
      date: invDate.value,
      description: invDescription.value || settings.description,
      kits: kits,
      rate: settings.rate,
      total: kits * settings.rate
    };

    currentPreviewData = data;
    renderInvoicePreview(data);
    updateEmailRecipientInfo();
    previewModal.classList.remove('hidden');
  });

  // --- Invoice Preview Rendering ---
  function renderInvoicePreview(data) {
    var billTo = '';
    if (settings.billCompany) billTo += '<strong>' + escHtml(settings.billCompany) + '</strong><br>';
    if (settings.billAttention) billTo += 'Attn: ' + escHtml(settings.billAttention) + '<br>';
    if (settings.billAddress) billTo += escHtml(settings.billAddress) + '<br>';
    if (settings.billCityStateZip) billTo += escHtml(settings.billCityStateZip) + '<br>';
    if (settings.billEmail) billTo += escHtml(settings.billEmail);

    var fromInfo = '<strong>' + escHtml(settings.name) + '</strong><br>';
    if (settings.address) fromInfo += escHtml(settings.address) + '<br>';
    if (settings.cityStateZip) fromInfo += escHtml(settings.cityStateZip) + '<br>';
    if (settings.phone) fromInfo += escHtml(settings.phone) + '<br>';
    if (settings.email) fromInfo += escHtml(settings.email);

    invoicePreview.innerHTML =
      '<div class="inv-header">' +
        '<div class="inv-title">INVOICE</div>' +
        '<div class="inv-from">' + fromInfo + '</div>' +
      '</div>' +
      '<div class="inv-meta">' +
        '<div class="inv-meta-section">' +
          '<h3>Bill To</h3>' +
          '<p>' + billTo + '</p>' +
        '</div>' +
        '<div class="inv-meta-section" style="text-align:right;">' +
          '<h3>Invoice Details</h3>' +
          '<p><strong>Invoice #:</strong> ' + data.number + '</p>' +
          '<p><strong>Date:</strong> ' + formatDate(data.date) + '</p>' +
          '<p><strong>Terms:</strong> ' + escHtml(settings.terms) + '</p>' +
        '</div>' +
      '</div>' +
      '<table class="inv-table">' +
        '<thead><tr>' +
          '<th>Description</th>' +
          '<th>Date</th>' +
          '<th>Qty</th>' +
          '<th>Rate</th>' +
          '<th>Amount</th>' +
        '</tr></thead>' +
        '<tbody><tr>' +
          '<td>' + escHtml(data.description) + '</td>' +
          '<td>' + formatDate(data.date) + '</td>' +
          '<td>' + data.kits + '</td>' +
          '<td>' + formatCurrency(data.rate) + '</td>' +
          '<td>' + formatCurrency(data.total) + '</td>' +
        '</tr></tbody>' +
      '</table>' +
      '<div class="inv-total-row">' +
        '<span>TOTAL DUE</span>' +
        '<span>' + formatCurrency(data.total) + '</span>' +
      '</div>' +
      '<div class="inv-breakdown">' +
        data.kits + ' kit' + (data.kits !== 1 ? 's' : '') + ' &times; ' + formatCurrency(data.rate) + ' per kit = ' + formatCurrency(data.total) +
      '</div>' +
      '<div class="inv-footer">' +
        '<p>Payment is due upon receipt of this invoice. Please make checks payable to <strong>' + escHtml(settings.name) + '</strong> or send payment via email to <strong>' + escHtml(settings.email) + '</strong>.</p>' +
        '<p style="margin-top:8px;">Thank you for your business!</p>' +
      '</div>';
  }

  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Close preview
  btnClosePreview.addEventListener('click', function () {
    previewModal.classList.add('hidden');
  });

  // Print
  btnPrint.addEventListener('click', function () {
    window.print();
  });

  // Show email recipient info when preview opens
  function updateEmailRecipientInfo() {
    var recipientInfo = document.getElementById('email-recipient-info');
    if (settings.billEmail) {
      recipientInfo.textContent = 'Email will be sent to: ' + settings.billEmail;
    } else {
      recipientInfo.innerHTML = '<span style="color:#dc2626;">No "Bill To" email set! Go to Settings to add one.</span>';
    }
  }

  // Email invoice
  btnEmailInvoice.addEventListener('click', function () {
    var recipient = settings.billEmail || '';

    if (!recipient) {
      showToast('Set a Bill To email in Settings first!');
      return;
    }

    // Use the currently displayed preview data
    var invNum = currentPreviewData ? currentPreviewData.number : '';
    var kits = currentPreviewData ? currentPreviewData.kits : 0;
    var total = currentPreviewData ? formatCurrency(currentPreviewData.total) : '$0.00';

    var subject = encodeURIComponent('Invoice #' + invNum + ' from ' + settings.name + ' - ' + total);
    var body = encodeURIComponent(
      'Hello,\n\n' +
      'Please find attached Invoice #' + invNum + ' for ' + kits + ' ' + settings.description + '(s).\n\n' +
      'Total Due: ' + total + '\n' +
      'Payment Terms: ' + settings.terms + '\n\n' +
      'Please make checks payable to ' + settings.name + ' or send payment via email to ' + settings.email + '.\n\n' +
      'Thank you for your business!\n\n' +
      settings.name + '\n' +
      settings.email
    );

    // Try to open Gmail compose (works on mobile and desktop)
    var gmailUrl = 'https://mail.google.com/mail/?view=cm&to=' + encodeURIComponent(recipient) + '&su=' + subject + '&body=' + body;

    // On mobile, mailto: is often better as it opens the default mail app
    var mailtoUrl = 'mailto:' + encodeURIComponent(recipient) + '?subject=' + subject + '&body=' + body;

    // Check if mobile - use mailto, otherwise try Gmail
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      window.location.href = mailtoUrl;
    } else {
      window.open(gmailUrl, '_blank');
    }

    showToast('Opening email to ' + recipient);
  });

  // Track current preview data for email
  var currentPreviewData = null;

  // --- Kit Tracker ---
  function renderTracker() {
    // Calculate stats
    var totalKits = 0;
    var totalInvoiced = 0;
    var totalPaid = 0;

    invoices.forEach(function (inv) {
      totalKits += inv.kits;
      totalInvoiced += inv.total;
      if (inv.datePaid) {
        totalPaid += inv.total;
      }
    });

    var outstanding = totalInvoiced - totalPaid;

    statKits.textContent = totalKits;
    statInvoiced.textContent = formatCurrency(totalInvoiced);
    statPaid.textContent = formatCurrency(totalPaid);
    statOutstanding.textContent = formatCurrency(outstanding);

    if (outstanding > 0) {
      statOutstanding.classList.add('has-outstanding');
    } else {
      statOutstanding.classList.remove('has-outstanding');
    }

    // Render invoice cards
    // Remove old cards (keep empty state)
    var oldCards = invoiceList.querySelectorAll('.invoice-card');
    oldCards.forEach(function (card) { card.remove(); });

    if (invoices.length === 0) {
      emptyState.style.display = '';
      return;
    }

    emptyState.style.display = 'none';

    // Sort by invoice number descending (newest first)
    var sorted = invoices.slice().sort(function (a, b) { return b.number - a.number; });

    sorted.forEach(function (inv) {
      var card = document.createElement('div');
      card.className = 'invoice-card';
      if (inv.datePaid) {
        card.classList.add('paid');
      } else if (inv.howSent) {
        card.classList.add('sent');
      }

      var statusClass, statusText;
      if (inv.datePaid) {
        statusClass = 'status-paid';
        statusText = 'Paid';
      } else if (inv.howSent) {
        statusClass = 'status-sent';
        statusText = 'Sent';
      } else {
        statusClass = 'status-unpaid';
        statusText = 'Unsent';
      }

      card.innerHTML =
        '<div class="invoice-card-header">' +
          '<span class="invoice-card-number">Invoice #' + inv.number + '</span>' +
          '<span class="invoice-card-amount">' + formatCurrency(inv.total) + '</span>' +
        '</div>' +
        '<div class="invoice-card-details">' +
          '<span class="invoice-card-kits">' + formatDate(inv.date) + ' &middot; ' + inv.kits + ' kit' + (inv.kits !== 1 ? 's' : '') + '</span>' +
          '<span class="invoice-card-status ' + statusClass + '">' + statusText + '</span>' +
        '</div>';

      card.addEventListener('click', function () {
        loadInvoiceForEditing(inv.id);
      });

      invoiceList.appendChild(card);
    });
  }

  // --- Edit Modal (for tracker items) ---
  function openEditModal(invoiceId) {
    var inv = invoices.find(function (i) { return i.id === invoiceId; });
    if (!inv) return;

    editTrackerId.value = inv.id;
    editModalTitle.textContent = 'Invoice #' + inv.number + ' - ' + formatCurrency(inv.total);
    editHowSent.value = inv.howSent || '';
    editDatePaid.value = inv.datePaid || '';
    editNotes.value = inv.notes || '';
    editModal.classList.remove('hidden');
  }

  editTrackerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = editTrackerId.value;
    var inv = invoices.find(function (i) { return i.id === id; });
    if (!inv) return;

    inv.howSent = editHowSent.value;
    inv.datePaid = editDatePaid.value;
    inv.notes = editNotes.value.trim();
    saveInvoices(invoices);
    editModal.classList.add('hidden');
    renderTracker();
    showToast('Invoice updated!');
  });

  btnCancelEdit.addEventListener('click', function () {
    editModal.classList.add('hidden');
  });

  // View / Print invoice from the tracker edit modal
  document.getElementById('btn-view-invoice-from-tracker').addEventListener('click', function () {
    var id = editTrackerId.value;
    var inv = invoices.find(function (i) { return i.id === id; });
    if (!inv) return;

    var data = {
      number: inv.number,
      date: inv.date,
      description: inv.description || settings.description,
      kits: inv.kits,
      rate: inv.rate,
      total: inv.total
    };

    currentPreviewData = data;
    editModal.classList.add('hidden');
    renderInvoicePreview(data);
    updateEmailRecipientInfo();
    previewModal.classList.remove('hidden');
  });

  btnDeleteInvoice.addEventListener('click', function () {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    var id = editTrackerId.value;
    invoices = invoices.filter(function (i) { return i.id !== id; });
    saveInvoices(invoices);
    editModal.classList.add('hidden');
    renderTracker();
    showToast('Invoice deleted');
  });

  // Close modals on backdrop click
  previewModal.addEventListener('click', function (e) {
    if (e.target === previewModal) {
      previewModal.classList.add('hidden');
    }
  });

  editModal.addEventListener('click', function (e) {
    if (e.target === editModal) {
      editModal.classList.add('hidden');
    }
  });

  // --- Init ---
  renderTracker();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {
      // Service worker registration failed, app still works
    });
  }
})();
