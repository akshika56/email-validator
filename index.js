
class EmailValidator {
    constructor() {
        this.emailInput = document.getElementById('email');
        this.validationIcon = document.getElementById('validationIcon');
        this.message = document.getElementById('message');
        this.validateBtn = document.getElementById('validateBtn');
        this.spinner = document.getElementById('spinner');
        this.resultSection = document.getElementById('resultSection');
        this.resultCard = document.getElementById('resultCard');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultTitle = document.getElementById('resultTitle');
        this.resultDescription = document.getElementById('resultDescription');
        this.form = document.getElementById('emailForm');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Real-time validation as user types
        this.emailInput.addEventListener('input', () => {
            this.validateRealTime();
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateEmail();
        });
        
        // Clear validation when input is empty
        this.emailInput.addEventListener('blur', () => {
            if (!this.emailInput.value.trim()) {
                this.clearValidation();
            }
        });
    }
    
    validateRealTime() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.clearValidation();
            return;
        }
        
        if (this.isValidEmail(email)) {
            this.showValidState();
        } else {
            this.showInvalidState();
        }
    }
    
    isValidEmail(email) {
        // Comprehensive email regex pattern
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        // Additional checks
        const hasValidStructure = emailRegex.test(email);
        const hasValidLength = email.length <= 254; // RFC 5321 limit
        const hasValidLocalPart = email.split('@')[0].length <= 64; // RFC 5321 limit
        
        return hasValidStructure && hasValidLength && hasValidLocalPart;
    }
    
    showValidState() {
        this.emailInput.className = 'valid';
        this.validationIcon.className = 'validation-icon valid';
        this.message.textContent = 'Valid email format';
        this.message.className = 'message valid';
    }
    
    showInvalidState() {
        this.emailInput.className = 'invalid';
        this.validationIcon.className = 'validation-icon invalid';
        this.message.textContent = 'Please enter a valid email address';
        this.message.className = 'message invalid';
    }
    
    clearValidation() {
        this.emailInput.className = '';
        this.validationIcon.className = 'validation-icon';
        this.message.textContent = '';
        this.message.className = 'message';
    }
    
    async validateEmail() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showError('Please enter an email address');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        this.hideResult();
        
        // Simulate API call delay for better UX
        await this.delay(1000);
        
        try {
            const validation = this.performDetailedValidation(email);
            this.setLoadingState(false);
            this.showResult(validation);
        } catch (error) {
            this.setLoadingState(false);
            this.showError('An error occurred during validation');
        }
    }
    
    performDetailedValidation(email) {
        const result = {
            email: email,
            isValid: false,
            errors: [],
            suggestions: []
        };
        
        // Basic format check
        if (!this.isValidEmail(email)) {
            result.errors.push('Invalid email format');
        }
        
        // Length checks
        if (email.length > 254) {
            result.errors.push('Email address is too long (max 254 characters)');
        }
        
        const [localPart, domain] = email.split('@');
        
        if (!localPart || !domain) {
            result.errors.push('Email must contain @ symbol with text before and after');
            return result;
        }
        
        // Local part validation
        if (localPart.length > 64) {
            result.errors.push('Local part (before @) is too long (max 64 characters)');
        }
        
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            result.errors.push('Local part cannot start or end with a period');
        }
        
        if (localPart.includes('..')) {
            result.errors.push('Local part cannot contain consecutive periods');
        }
        
        // Domain validation
        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
            result.errors.push('Domain must contain at least one period');
        }
        
        if (domainParts.some(part => !part.length)) {
            result.errors.push('Domain parts cannot be empty');
        }
        
        // Common domain suggestions
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const similarDomain = this.findSimilarDomain(domain, commonDomains);
        if (similarDomain && similarDomain !== domain) {
            result.suggestions.push(`Did you mean ${localPart}@${similarDomain}?`);
        }
        
        result.isValid = result.errors.length === 0;
        
        return result;
    }
    
    findSimilarDomain(domain, commonDomains) {
        const threshold = 2; // Maximum edit distance
        
        for (const commonDomain of commonDomains) {
            if (this.levenshteinDistance(domain.toLowerCase(), commonDomain) <= threshold) {
                return commonDomain;
            }
        }
        
        return null;
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.validateBtn.classList.add('loading');
            this.validateBtn.disabled = true;
            this.validateBtn.querySelector('span').textContent = 'Validating...';
        } else {
            this.validateBtn.classList.remove('loading');
            this.validateBtn.disabled = false;
            this.validateBtn.querySelector('span').textContent = 'Validate Email';
        }
    }
    
    showResult(validation) {
        this.resultSection.classList.add('show');
        
        if (validation.isValid) {
            this.resultCard.className = 'result-card success';
            this.resultIcon.className = 'result-icon success';
            this.resultIcon.textContent = '✓';
            this.resultTitle.textContent = 'Valid Email Address';
            this.resultDescription.textContent = `${validation.email} is a valid email address format.`;
        } else {
            this.resultCard.className = 'result-card error';
            this.resultIcon.className = 'result-icon error';
            this.resultIcon.textContent = '✗';
            this.resultTitle.textContent = 'Invalid Email Address';
            
            let description = validation.errors.join('. ');
            if (validation.suggestions.length > 0) {
                description += ` ${validation.suggestions.join(' ')}`;
            }
            
            this.resultDescription.textContent = description;
        }
    }
    
    hideResult() {
        this.resultSection.classList.remove('show');
    }
    
    showError(message) {
        this.resultSection.classList.add('show');
        this.resultCard.className = 'result-card error';
        this.resultIcon.className = 'result-icon error';
        this.resultIcon.textContent = '!';
        this.resultTitle.textContent = 'Error';
        this.resultDescription.textContent = message;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the email validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmailValidator();
});