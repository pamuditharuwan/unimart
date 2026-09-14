// ==========================================================
// UniMart: Sri Lankan University Email Domain Analyzer & Validator
// Server-Side Verification for all Sri Lankan Higher Education Institutions
// ==========================================================

export const STATE_UNIVERSITIES_17 = [
  { no: 1, name: 'University of Colombo, Sri Lanka', domain: 'cmb.ac.lk', code: 'cmb' },
  { no: 2, name: 'University of Peradeniya, Sri Lanka', domain: 'pdn.ac.lk', code: 'pdn' },
  { no: 3, name: 'University of Sri Jayewardenepura, Sri Lanka', domain: 'sjp.ac.lk', code: 'sjp' },
  { no: 4, name: 'University of Kelaniya, Sri Lanka', domain: 'kln.ac.lk', code: 'kln' },
  { no: 5, name: 'University of Moratuwa, Sri Lanka', domain: 'uom.lk', code: 'uom' },
  { no: 6, name: 'University of Jaffna, Sri Lanka', domain: 'jfn.ac.lk', code: 'jfn' },
  { no: 7, name: 'University of Ruhuna, Sri Lanka', domain: 'ruh.ac.lk', code: 'ruh' },
  { no: 8, name: 'Eastern University, Sri Lanka', domain: 'esn.ac.lk', code: 'esn' },
  { no: 9, name: 'South Eastern University of Sri Lanka', domain: 'seu.ac.lk', code: 'seu' },
  { no: 10, name: 'Rajarata University of Sri Lanka', domain: 'rjt.ac.lk', code: 'rjt' },
  { no: 11, name: 'Sabaragamuwa University of Sri Lanka', domain: 'sab.ac.lk', code: 'sab' },
  { no: 12, name: 'Wayamba University of Sri Lanka', domain: 'wyb.ac.lk', code: 'wyb' },
  { no: 13, name: 'Uva Wellassa University of Sri Lanka', domain: 'uwu.ac.lk', code: 'uwu' },
  { no: 14, name: 'University of the Visual & Performing Arts', domain: 'vpa.ac.lk', code: 'vpa' },
  { no: 15, name: 'The Open University of Sri Lanka', domain: 'ou.ac.lk', code: 'ou' },
  { no: 16, name: 'University of Vavuniya, Sri Lanka', domain: 'vau.ac.lk', code: 'vau' },
  { no: 17, name: 'Gampaha Wickramarachchi University of Indigenous Medicine', domain: 'gwu.ac.lk', code: 'gwu' }
];

export const SRI_LANKAN_UNIVERSITIES = {
  // The 17 Official State Universities of Sri Lanka
  cmb: 'University of Colombo, Sri Lanka',
  pdn: 'University of Peradeniya, Sri Lanka',
  sjp: 'University of Sri Jayewardenepura, Sri Lanka',
  kln: 'University of Kelaniya, Sri Lanka',
  uom: 'University of Moratuwa, Sri Lanka',
  mrt: 'University of Moratuwa, Sri Lanka', // Moratuwa legacy code
  jfn: 'University of Jaffna, Sri Lanka',
  ruh: 'University of Ruhuna, Sri Lanka',
  esn: 'Eastern University, Sri Lanka',
  seu: 'South Eastern University of Sri Lanka',
  rjt: 'Rajarata University of Sri Lanka',
  sab: 'Sabaragamuwa University of Sri Lanka',
  wyb: 'Wayamba University of Sri Lanka',
  uwu: 'Uva Wellassa University of Sri Lanka',
  vpa: 'University of the Visual & Performing Arts',
  ou: 'The Open University of Sri Lanka',
  ousl: 'The Open University of Sri Lanka',
  vau: 'University of Vavuniya, Sri Lanka',
  gwu: 'Gampaha Wickramarachchi University of Indigenous Medicine'
};

export const FACULTY_MAP = {
  student: 'Student Account',
  students: 'Student Account',
  std: 'Student Account',
  stu: 'Student Account',
  fot: 'Faculty of Technology',
  tec: 'Faculty of Technology',
  tech: 'Faculty of Technology',
  fet: 'Faculty of Technology',
  ftech: 'Faculty of Technology',
  foet: 'Faculty of Engineering Technology',
  eng: 'Faculty of Engineering',
  foe: 'Faculty of Engineering',
  itfac: 'Faculty of Information Technology',
  ucsc: 'University of Colombo School of Computing',
  mit: 'Department of Industrial Management / IT',
  cst: 'Department of Computer Science & Technology',
  comp: 'Faculty of Computing',
  computing: 'Faculty of Computing',
  sci: 'Faculty of Science',
  fas: 'Faculty of Applied Sciences',
  appsc: 'Faculty of Applied Sciences',
  sct: 'Department of Science & Technology',
  mgt: 'Faculty of Management Studies',
  fmf: 'Faculty of Management & Finance',
  fmc: 'Faculty of Management & Commerce',
  fms: 'Faculty of Management Studies',
  fbs: 'Faculty of Business Studies',
  fcms: 'Faculty of Commerce & Management Studies',
  med: 'Faculty of Medicine',
  mfac: 'Faculty of Medicine',
  dental: 'Faculty of Dental Sciences',
  vet: 'Faculty of Veterinary Medicine & Animal Science',
  ahs: 'Faculty of Allied Health Sciences',
  agri: 'Faculty of Agriculture',
  arts: 'Faculty of Arts',
  ssh: 'Faculty of Social Sciences & Humanities',
  fhss: 'Faculty of Humanities & Social Sciences',
  hss: 'Faculty of Humanities & Social Sciences',
  law: 'Faculty of Law',
  arch: 'Faculty of Architecture'
};

export function parseSriLankanUniversityEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Please provide your university email.' };
  }

  const clean = email.toLowerCase().trim();
  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    return { isValid: false, error: 'Invalid email address format.' };
  }

  const [localPart, domain] = atParts;
  if (!localPart || !domain) {
    return { isValid: false, error: 'Invalid email address format.' };
  }

  // Check for Sri Lankan Academic TLD (.ac.lk) or University of Moratuwa (.uom.lk / uom.lk)
  const isAcLk = domain.endsWith('.ac.lk');
  const isUom = domain === 'uom.lk' || domain.endsWith('.uom.lk');

  if (!isAcLk && !isUom) {
    return {
      isValid: false,
      error: 'Registration is strictly restricted to official Sri Lankan university student email domains (@___.___ .ac.lk or @___.___ .uom.lk).'
    };
  }

  const parts = domain.split('.');
  let uniCode = '';
  let subCode = '';

  if (isUom) {
    uniCode = 'uom';
    if (domain !== 'uom.lk' && parts.length > 2) {
      subCode = parts[0];
    }
  } else if (isAcLk) {
    const acIdx = parts.indexOf('ac');
    if (acIdx < 1 || parts[acIdx + 1] !== 'lk') {
      return {
        isValid: false,
        error: 'Invalid academic domain structure. Expected @___.___ .ac.lk or @uom.lk format.'
      };
    }

    uniCode = parts[acIdx - 1];
    if (acIdx > 1) {
      subCode = parts[acIdx - 2];
    }
  }

  // Strictly verify the university code against the 17 state universities
  const knownUni = SRI_LANKAN_UNIVERSITIES[uniCode];
  if (!knownUni) {
    return {
      isValid: false,
      error: `Invalid university domain '${uniCode}'. Must belong to one of the 17 Sri Lankan state universities.`
    };
  }

  const universityName = knownUni;
  const facultyName = FACULTY_MAP[subCode] || (subCode ? subCode.toUpperCase() : '');

  return {
    isValid: true,
    universityCode: uniCode,
    universityName,
    facultyCode: subCode,
    facultyName,
    domain,
    isKnownInstitution: true
  };
}

export function isSriLankanUniversityEmail(email) {
  return parseSriLankanUniversityEmail(email).isValid;
}
