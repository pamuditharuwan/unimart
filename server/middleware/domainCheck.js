// ==========================================================
// UniMart: University Domain Verification Middleware
// ==========================================================
import dotenv from 'dotenv';
import { DEFAULT_ALLOWED_DOMAINS } from '../config/constants.js';
import { parseSriLankanUniversityEmail } from '../utils/universityDomains.js';

dotenv.config();

/**
 * Returns list of allowed university domains from environment or defaults
 */
export function getAllowedDomains() {
  const envDomains = process.env.ALLOWED_DOMAINS;
  if (!envDomains) return DEFAULT_ALLOWED_DOMAINS;
  return envDomains
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks whether an email matches any allowed university domain
 * Validates domain pattern @___.___ .ac.lk (e.g. @student.rjt.ac.lk, @eng.pdn.ac.lk, etc.)
 * @param {string} email
 * @returns {boolean}
 */
export function isUniversityEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const analysis = parseSriLankanUniversityEmail(email);
  if (analysis.isValid) return true;

  const lowerEmail = email.toLowerCase().trim();
  const allowed = getAllowedDomains();
  return allowed.some(domain => lowerEmail.endsWith(domain.toLowerCase()));
}

/**
 * Express middleware to enforce university domain on registration
 */
export function enforceUniversityDomain(req, res, next) {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      error: 'Email is required.'
    });
  }

  const analysis = parseSriLankanUniversityEmail(email);
  if (!analysis.isValid && !isUniversityEmail(email)) {
    return res.status(400).json({
      error: analysis.error || 'Access restricted. Registration requires a valid university email address (@___.___ .ac.lk).',
      allowedPattern: '@___.___ .ac.lk'
    });
  }

  // Attach detected university metadata for route handler
  req.universityInfo = analysis;
  next();
}
