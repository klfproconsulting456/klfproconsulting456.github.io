/**
 * KLFPRO Consulting - Core JavaScript Functionality
 * Version 2.0 - Enhanced for Financial Services
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("KLFPRO Banking Platform Initialized");
  
  // ======================
  // 1. MOBILE NAVIGATION
  // ======================
  
  // ======================
  // 2. FORM VALIDATION
  // ======================
  const setupFormValidation = () => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
          } else {
            field.style.borderColor = '';
          }
        });
        
        // Special validation for email fields
        const emailFields = this.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
          if (field.value && !/^\S+@\S+\.\S+$/.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
          }
        });
        
        // Special validation for phone fields
        const phoneFields = this.querySelectorAll('input[type="tel"]');
        phoneFields.forEach(field => {
          if (field.value && !/^[0-9]{10,15}$/.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
          }
        });
        
        if (!isValid) {
          e.preventDefault();
          console.log("Form validation failed");
          // In production, show user-friendly error messages
        } else {
          console.log("Form validation passed - ready for submission");
          // Here you would typically add AJAX submission logic
        }
      });
    });
  };

  // ======================
  // 3. ANALYTICS & TRACKING
  // ======================
  const trackAnalyticsEvents = () => {
    // Track all external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      if (!link.href.includes(window.location.hostname)) {
        link.addEventListener('click', function() {
          console.log(`Outbound link clicked: ${this.href}`);
          // ga('send', 'event', 'Outbound Link', 'click', this.href);
        });
      }
    });
    
    // Track CTA conversions
    document.querySelectorAll('.cta, .btn.primary').forEach(button => {
      button.addEventListener('click', function() {
        const ctaText = this.textContent.trim();
        const ctaType = this.classList.contains('primary') ? 'Primary' : 'Secondary';
        
        console.log(`CTA clicked: ${ctaText} (${ctaType})`);
        // ga('send', 'event', 'CTA', 'click', ctaText);
        
        // Special tracking for loan applications
        if (this.closest('#loan-application') || this.href.includes('apply')) {
          console.log("Loan application started");
          // ga('send', 'event', 'Conversion', 'Loan Application Start', 'Apply Now');
        }
      });
    });
    
    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function() {
        const formName = this.id || 'Unknown Form';
        console.log(`Form submitted: ${formName}`);
        // ga('send', 'event', 'Form', 'submit', formName);
      });
    });
  };

  // ======================
  // 4. LOAN CALCULATORS
  // ======================
  const initLoanCalculators = () => {
    // Placeholder for EMI calculator functionality
    const emiCalculator = document.querySelector('.emi-calculator');
    if (emiCalculator) {
      console.log("EMI calculator detected - would initialize here");
      // Implementation would go here
    }
  };

  // ======================
  // 5. CRM INTEGRATION
  // ======================
  const setupCRMIntegration = () => {
    // Placeholder for CRM dashboard functionality
    if (document.querySelector('.crm-dashboard')) {
      console.log("CRM dashboard detected - would initialize here");
      
      // Example: Click handlers for lead rows
      document.querySelectorAll('.lead-table tbody tr').forEach(row => {
        row.addEventListener('click', function() {
          console.log(`Viewing lead details for: ${this.cells[0].textContent}`);
          // In production, this would open a detailed view modal
        });
      });
    }
  };

  // ======================
  // 6. SMOOTH SCROLLING
  // ======================
  const setupSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, this.getAttribute('href'));
          }
        }
      });
    });
  };

  // ======================
  // 7. INITIALIZATION
  // ======================
  const init = () => {
    setupMobileMenu();
    setupFormValidation();
    trackAnalyticsEvents();
    initLoanCalculators();
    setupCRMIntegration();
    setupSmoothScrolling();
    
    // Dynamic copyright year
    const yearElement = document.querySelector('.copyright-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };
  
  init();
});

// ======================
// 8. PERFORMANCE OBSERVER
// ======================
if ('PerformanceObserver' in window) {
  const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`[Performance] ${entry.name}: ${entry.duration.toFixed(2)}ms`);
    }
  });
  perfObserver.observe({ entryTypes: ['measure', 'resource'] });
}