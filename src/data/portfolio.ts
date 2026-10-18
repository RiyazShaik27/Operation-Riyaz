export type ArchiveId = 'identity' | 'education' | 'certifications' | 'projects' | 'skills' | 'experience' | 'achievements';
export interface ArchiveDefinition {
  id: ArchiveId;
  label: string;
  code: string;
  subtitle: string;
  serial: string;
}
export const archiveDefinitions: ArchiveDefinition[] = [
  { id: 'identity', label: 'Identity', code: 'PERSONNEL DOSSIER', subtitle: 'Subject overview and contact channels', serial: '001' },
  { id: 'education', label: 'Education', code: 'ACADEMIC INTELLIGENCE', subtitle: 'Academic record and areas of study', serial: '002' },
  { id: 'certifications', label: 'Credentials', code: 'CREDENTIAL VAULT', subtitle: 'Original certificates and training documents', serial: '003' },
  { id: 'projects', label: 'Projects', code: 'ENGINEERING CASE FILES', subtitle: 'Security, AI and data science systems', serial: '004' },
  { id: 'skills', label: 'Skills', code: 'CAPABILITY MATRIX', subtitle: 'Technologies, tools and specialties', serial: '005' },
  { id: 'experience', label: 'Experience', code: 'MISSION HISTORY', subtitle: 'Internships, achievements and impact', serial: '006' },
  { id: 'achievements', label: 'Achievements', code: 'RECOGNITION FILES', subtitle: 'Leadership, recognitions and milestones', serial: '007' },
];
export const identity = {
  name: 'SHAIK RIYAZ',
  role: 'Cybersecurity & Digital Forensics · AI/ML · Data Science',
  email: 'shaikriyaz11011@gmail.com',
  github: 'https://github.com/RiyazShaik27',
  linkedin: 'https://www.linkedin.com/in/shaik-riyaz-761545251',
  portrait: './assets/portrait.jpg',
  resume: './assets/resume.pdf',
};
export const certifications = [
  { name: 'IBM Cyber Security Analyst', issuer: 'IBM Career Education', date: '2025', image: './assets/ibm-cyber.png' },
  { name: 'Oracle Java Foundations Associate', issuer: 'Oracle University', date: '2025', image: './assets/oracle-java.png' },
  { name: 'High Performing Coding — DSA Using Java', issuer: 'iamneo / neo colab', date: '2025', image: './assets/dsa-java.png' },
  { name: 'Generative AI Foundations', issuer: 'upGrad × Microsoft', date: '2025', image: './assets/generative-ai.png' },
];
export const projects = [
  { name: 'ASRA — Multi-Modal Phishing URL Detection', type: 'THREAT INTELLIGENCE / DEEP LEARNING', year: '2026', description: 'Led engineering of a multi-modal phishing URL detection system combining fine-tuned DistilBERT, CNN-BiLSTM, and domain features. Implemented a FastAPI backend and Chrome extension. Résumé-reported accuracy: 96.2%; recall: 94.8%.', stack: ['PyTorch', 'Hugging Face', 'FastAPI', 'React', 'DistilBERT'], url: 'https://github.com/RiyazShaik27/ASRA' },
  { name: 'Ransomware Traffic Classification', type: 'NETWORK DEFENSE / MACHINE LEARNING', year: '2025', description: 'Network-traffic classification using Random Forest and TensorFlow/Keras with feature-processing automation. Latest résumé reports 94% accuracy.', stack: ['Python', 'Random Forest', 'TensorFlow', 'Scikit-learn'], url: 'https://github.com/RiyazShaik27/Ransomware-Traffic-Classification-Model' },
  { name: 'Steganography GUI', type: 'SECURE COMMUNICATION / DESKTOP', year: '2024', description: 'Tkinter application to conceal and extract data inside images using least significant bits. Résumé reports a 30% encoding-throughput improvement.', stack: ['Python', 'Tkinter', 'NumPy', 'Pillow'], url: 'https://github.com/RiyazShaik27/Steganography-GUI' },
  { name: 'CipherForge', type: 'CRYPTOGRAPHY / SOFTWARE', year: 'PORTFOLIO', description: 'Java desktop tool supporting several classical encryption and decryption algorithms with cipher selection and key validation.', stack: ['Java', 'Swing', 'Cryptography'], url: 'https://github.com/RiyazShaik27/CipherForge-GUI' },
  { name: 'Customer Propensity Prediction', type: 'FINANCIAL ANALYTICS / PREDICTIVE ML', year: 'PORTFOLIO', description: 'Term-deposit subscription propensity model using Random Forest. The earlier portfolio reports a 0.92 ROC-AUC score.', stack: ['Python', 'Random Forest', 'Analytics'], url: 'https://github.com/RiyazShaik27/Predicting-Customer-Propensity-to-Subscribe-for-a-Term-Deposit' },
  { name: 'Online Advertising Performance', type: 'DATA ANALYTICS / BUSINESS INTELLIGENCE', year: 'PORTFOLIO', description: 'Advertising campaign analysis and a custom Synergy Score to guide spending recommendations.', stack: ['Python', 'EDA', 'Business Intelligence'], url: 'https://github.com/RiyazShaik27/Online-Advertising-Performance-Analysis' },
  { name: 'Global YouTube Statistics', type: 'DATA SCIENCE / INSIGHTS', year: 'PORTFOLIO', description: 'Exploratory analysis identifying patterns in global YouTube creator performance.', stack: ['Python', 'Visualization', 'Analytics'], url: 'https://github.com/RiyazShaik27/Global-YouTube-Statistics-Analysis' },
];
export const skillGroups = [
  { name: 'SECURITY TOOLKIT', items: ['Kali Linux', 'Burp Suite', 'Nmap', 'Wireshark', 'DVWA', 'WebGoat', 'OWASP', 'Maltego', 'Autopsy'] },
  { name: 'PROGRAMMING', items: ['Python', 'Java', 'SQL', 'JavaScript', 'HTML', 'CSS'] },
  { name: 'AI & ENGINEERING', items: ['PyTorch', 'TensorFlow/Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Streamlit', 'NetworkX', 'Tkinter'] },
  { name: 'VISUAL ANALYTICS', items: ['Power BI', 'Tableau', 'Google Looker Studio', 'Matplotlib', 'Seaborn'] },
  { name: 'CLOUD', items: ['AWS', 'Azure', 'Google Cloud'] },
];
