import { useRef, useState } from 'react';
import { ArrowUpRight, Award, BrainCircuit, BriefcaseBusiness, Download, ExternalLink, GraduationCap, LockKeyhole, Mail, Maximize2, Shield, ShieldCheck, Trophy } from 'lucide-react';
import type { ArchiveId } from '../data/portfolio';
import { certifications, identity, projects, skillGroups } from '../data/portfolio';
import { DetailDialog } from './DetailDialog';

function Record({code,title,children,details}:{code:string;title:string;children:React.ReactNode;details?:React.ReactNode}){
  const [open,setOpen]=useState(false);
  const trigger=useRef<HTMLButtonElement>(null);
  const expand=()=>{trigger.current?.focus({preventScroll:true});setOpen(true);};
  return <><article className="intel-record expandable-record" onClick={event=>{
    if(event.target instanceof Element&&!event.target.closest('a,button')&&!window.getSelection()?.toString())expand();
  }}><span className="micro eyebrow">{code}</span><h3>{title}</h3>{children}
    <button ref={trigger} type="button" className="record-expand" aria-label={`View ${title} details`} aria-haspopup="dialog" onClick={expand}><Maximize2 size={15}/> VIEW FULL DETAILS <ArrowUpRight size={15}/></button>
  </article>{open&&<DetailDialog code={code} title={title} onClose={()=>setOpen(false)}>{details??children}</DetailDialog>}</>;
}
function LinkOut({href,children}:{href:string;children:React.ReactNode}){
  return <a className="data-link" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14}/></a>;
}
export function ArchiveContent({id}:{id:ArchiveId}){
  const [zoom,setZoom]=useState<typeof certifications[number]|null>(null);
  return <>
    {id==='identity'&&<Record code="PERSONNEL DOSSIER // IDENTITY" title="Shaik Riyaz"><div className="intel-grid profile-grid">
      <div className="profile-pic"><img src={identity.portrait} alt="Shaik Riyaz professional portrait"/><div className="scan-bar"/></div>
      <div className="detail-column">
        <p className="eyebrow micro">IDENTITY RECONSTRUCTED / MATCH CONFIRMED</p><h3 className="giant-name">SHAIK RIYAZ</h3>
        <p className="record-paragraph">Cybersecurity & Digital Forensics graduate with hands-on work in AI/ML, cybersecurity, data science, threat detection, and analytical systems.</p>
        <div className="identity-grid"><div><small>EDUCATION</small><strong>VIT Bhopal University</strong></div><div><small>DEGREE</small><strong>B.Tech Cybersecurity & Digital Forensics</strong></div><div><small>GRADUATION</small><strong>2026</strong></div><div><small>CGPA</small><strong>8.24 / 10</strong></div></div>
        <div className="action-links"><a href={identity.resume} download className="primary-action"><Download size={16}/> DOWNLOAD RÉSUMÉ</a><LinkOut href={identity.github}>GITHUB</LinkOut><LinkOut href={identity.linkedin}>LINKEDIN</LinkOut><a className="data-link" href={`mailto:${identity.email}`}><Mail size={14}/> EMAIL</a></div>
      </div>
    </div></Record>}
    {id==='education'&&<div className="intel-grid">
      <Record code="ACADEMIC RECORD // 2022 — 2026" title="VIT Bhopal University"><GraduationCap className="record-icon"/><p className="record-paragraph">Bachelor of Technology — Cybersecurity & Digital Forensics</p><span className="metric">8.24<small> / 10 CGPA</small></span><p className="muted-copy">Education dates and CGPA are from the uploaded résumé.</p></Record>
      <Record code="KNOWLEDGE DOMAINS" title="Specializations"><Shield className="record-icon"/><div className="tag-cloud">{['Cybersecurity','Digital Forensics','Machine Learning','Deep Learning','Network Security','Data Analytics','Programming'].map(tag=><span className="chip" key={tag}>{tag}</span>)}</div></Record>
    </div>}
    {id==='certifications'&&<div className="intel-grid certificates-grid">{certifications.map((cert,i)=><article className="intel-record certificate-record expandable-record" key={cert.name} onClick={event=>{if(event.target instanceof Element&&!event.target.closest('button,a')){event.currentTarget.querySelector('button')?.focus({preventScroll:true});setZoom(cert);}}}>
      <span className="eyebrow micro">CREDENTIAL {String(i+1).padStart(2,'0')} / {cert.date}</span><button type="button" className="cert-preview" onClick={()=>setZoom(cert)} aria-haspopup="dialog" aria-label={`Enlarge ${cert.name} certificate`}><img src={cert.image} alt={`${cert.name} certificate thumbnail`}/><span><ExternalLink size={14}/> INSPECT DOCUMENT</span></button><h3>{cert.name}</h3><p className="muted-copy">{cert.issuer}</p><button className="record-expand" type="button" aria-haspopup="dialog" onClick={()=>setZoom(cert)}><Maximize2 size={15}/> OPEN CREDENTIAL <ArrowUpRight size={14}/></button>
    </article>)}</div>}
    {id==='projects'&&<div className="intel-grid projects-grid">{projects.map((project,i)=><Record key={project.name} code={`CASEFILE_${String(i+1).padStart(3,'0')} // ${project.year}`} title={project.name}>
      <span className="case-type">{project.type}</span><section className="record-section"><h4>PROJECT OVERVIEW</h4><p className="record-paragraph">{project.description}</p></section><section className="record-section"><h4>TOOLS & TECHNOLOGIES</h4><div className="tag-cloud">{project.stack.map(tag=><span className="chip" key={tag}>{tag}</span>)}</div></section><section className="record-section"><h4>SOURCE CODE & LINKS</h4>{project.url?<LinkOut href={project.url}>OPEN REPOSITORY</LinkOut>:<><p className="muted-copy">The repository link for this project has not been added yet.</p><LinkOut href={identity.github}>BROWSE GITHUB PROFILE</LinkOut></>}</section>
    </Record>)}</div>}
    {id==='skills'&&<div className="intel-grid">{skillGroups.map((group,i)=><Record key={group.name} code={`CAPABILITY NODE ${String(i+1).padStart(2,'0')}`} title={group.name}>
      <div className="capability-line"><span className="capability-node"/><span className="capability-node"/><span className="capability-node"/><span className="capability-node"/></div><section className="record-section"><h4>TOOLS & CAPABILITIES</h4><div className="tag-cloud">{group.items.map(item=><span className="chip" key={item}>{item}</span>)}</div></section>
    </Record>)}</div>}
    {id==='experience'&&<div className="intel-grid">
      <Record code="MISSION HISTORY // OCT — NOV 2025" title="Excelerate"><BriefcaseBusiness className="record-icon"/><p className="case-type">CYBER RISK ASSESSMENT & COMPLIANCE INTERN</p><p className="record-paragraph">Evaluated security posture through vulnerability identification, threat simulations and risk assessment against NIST and ISO 27001 frameworks. Authored mitigation recommendations and a compliance report.</p><span className="chip positive">STAR PERFORMER • 90% EVALUATION (REPORTED)</span></Record>
      <Record code="MISSION HISTORY // JUL — SEP 2025" title="Finlatics"><BrainCircuit className="record-icon"/><p className="case-type">DATA SCIENCE INTERN</p><p className="record-paragraph">The older portfolio describes predictive modeling, campaign analysis, YouTube statistics research, and data-driven reporting during this internship.</p><span className="muted-copy small-copy">Source: earlier portfolio. Additional supporting records can be added later.</span></Record>
    </div>}
    {id==='achievements'&&<div className="intel-grid">
      <Record code="RECOGNITION // 2025" title="Star Performer"><Award className="record-icon"/><p className="record-paragraph">Excelerate internship recognition for technical ownership and problem solving; résumé reports an overall 90% evaluation score.</p></Record>
      <Record code="PROJECT MILESTONE // 2024" title="Smart India Hackathon"><ShieldCheck className="record-icon"/><p className="record-paragraph">Developed a facial-recognition-based attendance prototype.</p></Record>
      <Record code="LEADERSHIP // 2018 — 2019" title="Pupil Leader"><Trophy className="record-icon"/><p className="record-paragraph">Student leadership at St. Ann’s School.</p></Record>
    </div>}
    <p className="source-disclaimer"><LockKeyhole size={13}/> All intrusion imagery is fictional. Professional data comes from the supplied résumé, certificates, and previous portfolio; reported project metrics are not independently audited.</p>
    {zoom&&<DetailDialog title={zoom.name} code={`CREDENTIAL // ${zoom.date}`} closeLabel="Close certificate" onClose={()=>setZoom(null)}>
      <p className="record-paragraph">{zoom.issuer} · {zoom.date}</p><img className="credential-full-image" src={zoom.image} alt={`${zoom.name} certificate in full resolution`}/><LinkOut href={zoom.image}>OPEN ORIGINAL DOCUMENT</LinkOut>
    </DetailDialog>}
  </>;
}
