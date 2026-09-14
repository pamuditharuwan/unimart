// ==========================================================
// UniMart: Sri Lankan University Email Domain Analyzer & Validator
// Comprehensive domain structure parser for all Sri Lankan Higher
// Education Institutions under the .ac.lk academic domain namespace.
// ==========================================================

export const SRI_LANKAN_UNIVERSITIES = {
  // UGC State Universities
  rjt: 'Rajarata University of Sri Lanka',
  cmb: 'University of Colombo',
  pdn: 'University of Peradeniya',
  mrt: 'University of Moratuwa',
  sjp: 'University of Sri Jayewardenepura',
  kln: 'University of Kelaniya',
  ruh: 'University of Ruhuna',
  wyb: 'Wayamba University of Sri Lanka',
  sab: 'Sabaragamuwa University of Sri Lanka',
  seu: 'South Eastern University of Sri Lanka',
  esn: 'Eastern University, Sri Lanka',
  jfn: 'University of Jaffna',
  uwu: 'Uva Wellassa University',
  ou: 'The Open University of Sri Lanka',
  ousl: 'The Open University of Sri Lanka',
  kdu: 'General Sir John Kotelawala Defence University',
  vau: 'University of Vavuniya',
  gwu: 'Gampaha Wickramarachchi University of Indigenous Medicine',
  vpa: 'University of the Visual & Performing Arts',

  // Non-State & Recognized Higher Education Institutes
  nsbm: 'NSBM Green University',
  sliit: 'Sri Lanka Institute of Information Technology',
  iit: 'Informatics Institute of Technology',
  sltc: 'Sri Lanka Technological Campus',
  sliate: 'Sri Lanka Institute of Advanced Technological Education',
  nibm: 'National Institute of Business Management',
  cinec: 'CINEC Campus'
};

export const FACULTY_MAP = {
  // Student subdomains
  student: 'Student Account',
  students: 'Student Account',
  std: 'Student Account',
  stu: 'Student Account',

  // Engineering & Technology
  fot: 'Faculty of Technology',
  tec: 'Faculty of Technology',
  tech: 'Faculty of Technology',
  fet: 'Faculty of Technology',
  ftech: 'Faculty of Technology',
  foet: 'Faculty of Engineering Technology',
  eng: 'Faculty of Engineering',
  foe: 'Faculty of Engineering',

  // Computing & Information Technology
  itfac: 'Faculty of Information Technology',
  ucsc: 'University of Colombo School of Computing',
  mit: 'Department of Industrial Management / IT',
  cst: 'Department of Computer Science & Technology',
  comp: 'Faculty of Computing',
  computing: 'Faculty of Computing',

  // Science & Applied Sciences
  sci: 'Faculty of Science',
  fas: 'Faculty of Applied Sciences',
  appsc: 'Faculty of Applied Sciences',
  sct: 'Department of Science & Technology',

  // Management & Business Studies
  mgt: 'Faculty of Management Studies',
  fmf: 'Faculty of Management & Finance',
  fmc: 'Faculty of Management & Commerce',
  fms: 'Faculty of Management Studies',
  fbs: 'Faculty of Business Studies',
  fcms: 'Faculty of Commerce & Management Studies',

  // Medicine & Healthcare
  med: 'Faculty of Medicine',
  mfac: 'Faculty of Medicine',
  dental: 'Faculty of Dental Sciences',
  vet: 'Faculty of Veterinary Medicine & Animal Science',
  ahs: 'Faculty of Allied Health Sciences',

  // Agriculture
  agri: 'Faculty of Agriculture',

  // Arts, Humanities & Social Sciences
  arts: 'Faculty of Arts',
  ssh: 'Faculty of Social Sciences & Humanities',
  fhss: 'Faculty of Humanities & Social Sciences',
  hss: 'Faculty of Humanities & Social Sciences',

  // Law & Architecture
  law: 'Faculty of Law',
  arch: 'Faculty of Architecture'
};

/**
 * Analyzes and validates an email address against Sri Lankan university domain structures.
 * Format: [localpart]@[subdomain.]<university_code>.ac.lk
 * 
 * @param {string} email - Email string to analyze
 * @returns {object} Analysis result { isValid, universityCode, universityName, facultyCode, facultyName, domain, error }
 */
export function parseSriLankanUniversityEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Please enter your university email.' };
  }

  const clean = email.toLowerCase().trim();
  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  const [localPart, domain] = atParts;
  if (!localPart || !domain) {
    return { isValid: false, error: 'Please enter a complete email address.' };
  }

  // Check for Sri Lankan Academic TLD (.ac.lk) or recognized LK campus domain (e.g. sliit.lk)
  const isAcLk = domain.endsWith('.ac.lk');
  const isSliit = domain === 'sliit.lk' || domain.endsWith('.sliit.lk');

  if (!isAcLk && !isSliit) {
    return {
      isValid: false,
      error: 'Registration is restricted to Sri Lankan university email domains (@___.___ .ac.lk).'
    };
  }

  const parts = domain.split('.');
  let uniCode = '';
  let subCode = '';

  if (isAcLk) {
    const acIdx = parts.indexOf('ac');
    // Must have at least a university code before 'ac.lk' (e.g., [sub, uni, 'ac', 'lk'] or [uni, 'ac', 'lk'])
    if (acIdx < 1 || parts[acIdx + 1] !== 'lk') {
      return {
        isValid: false,
        error: 'Invalid academic domain structure. Expected @___.___ .ac.lk format.'
      };
    }

    uniCode = parts[acIdx - 1];
    if (acIdx > 1) {
      subCode = parts[acIdx - 2];
    }
  } else if (isSliit) {
    uniCode = 'sliit';
    subCode = parts[0] !== 'sliit' ? parts[0] : '';
  }

  if (!uniCode) {
    return {
      isValid: false,
      error: 'Could not identify university in domain. Expected @___.___ .ac.lk format.'
    };
  }

  const knownUni = SRI_LANKAN_UNIVERSITIES[uniCode];
  const universityName = knownUni || `${uniCode.toUpperCase()} University (.ac.lk)`;
  const facultyName = FACULTY_MAP[subCode] || (subCode ? subCode.toUpperCase() : '');

  return {
    isValid: true,
    universityCode: uniCode,
    universityName,
    facultyCode: subCode,
    facultyName,
    domain,
    isKnownInstitution: Boolean(knownUni)
  };
}

/**
 * Quick boolean checker for Sri Lankan university email
 * @param {string} email
 * @returns {boolean}
 */
export function isSriLankanUniversityEmail(email) {
  return parseSriLankanUniversityEmail(email).isValid;
}

/**
 * Return list of commonly used Sri Lankan universities for selectors/hints
 */
export function getPopularSriLankanUniversities() {
  return Object.entries(SRI_LANKAN_UNIVERSITIES).map(([code, name]) => ({
    code,
    name,
    sampleDomain: `@student.${code}.ac.lk`
  }));
}
