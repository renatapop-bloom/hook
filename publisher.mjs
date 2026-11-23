export const fields=['headline','body_copy','banner_image','banner_alt','cta_text','cta_url','offers_heading','subject_a','preheader','eyebrow','button_radius','secondary_cta_text','secondary_cta_url','feature_heading','feature_body','feature_image','feature_cta_text','feature_cta_url','nav_link_1','nav_link_2','nav_link_3','nav_url_1','nav_url_2','nav_url_3','footer_copy'];
export const toggles=['secondary_cta_enabled','feature_enabled'];
export const centralFields=[...fields,...toggles,'subject_b','subject_override','local_offer_enabled','local_offer_heading'];
export const allowedOrigins=['https://app.exponea.com','https://demoapp.exponea.com','https://demoapp.bloomreach.com'];
const catalogUrl='https://api-demoapp.exponea.com/data/v2/projects/bf48fee4-d20d-11f1-a3bd-9e8d41698ac1/catalogs/6b041ab9210fd98ae46540af/items/en';
export function validate(properties){
 const optional=new Set(['eyebrow','preheader','secondary_cta_text','secondary_cta_url','feature_heading','feature_body','feature_image','feature_cta_text','feature_cta_url']);
 for(const key of fields){if(typeof properties[key]!=='string'||(!optional.has(key)&&!properties[key].trim()))throw Error('Complete '+key.replaceAll('_',' '));if(properties[key].length>(['body_copy','feature_body','footer_copy'].includes(key)?3000:2000))throw Error('Shorten '+key.replaceAll('_',' '));if(/{{|{%/.test(properties[key]))throw Error('Use plain text in content fields; keep personalisation in the fixed template.');}
 for(const key of toggles)if(typeof properties[key]!=='boolean')throw Error('Invalid section setting');
 const urls=['banner_image','cta_url','nav_url_1','nav_url_2','nav_url_3'];
 if(properties.secondary_cta_enabled){if(!properties.secondary_cta_text.trim())throw Error('Add secondary button text');urls.push('secondary_cta_url');}
 if(properties.feature_enabled){for(const key of ['feature_heading','feature_body','feature_cta_text'])if(!properties[key].trim())throw Error('Complete '+key.replaceAll('_',' '));urls.push('feature_image','feature_cta_url');}
 for(const key of urls){let url;try{url=new URL(properties[key]);}catch{throw Error('Add a valid URL for '+key.replaceAll('_',' '));}if(url.protocol!=='https:'||url.username||url.password)throw Error('Use a secure public URL for '+key.replaceAll('_',' '));}
 if(!['24px','6px'].includes(properties.button_radius))throw Error('Choose a button shape');
 return properties;
}
export function buildWebhook(properties,previous={}){
 validate(properties);
 if(previous.auth?.type==='basic'&&!previous.auth.password)throw Error('Use a Bloomreach authentication integration instead of legacy node-level Basic authentication.');
 if((previous.headers||[]).some(h=>h.type==='secret'&&!h.value))throw Error('Use a Bloomreach authentication integration for the preset; a hidden legacy secret header cannot be copied by this editor.');
 const consentCategory=typeof previous.consent_category==='string'&&previous.consent_category.trim()?previous.consent_category:null;
 return {...previous,consent_category:consentCategory,general_consent:consentCategory===null,frequency_policy:previous.frequency_policy||'unlimited-policy',url:catalogUrl,method:'PUT',response_handling:'json',auth:previous.auth??null,headers:[{name:'Content-Type',value:'application/json',type:'public'},...(previous.headers||[]).filter(h=>h.name.toLowerCase()!=='content-type')],body:JSON.stringify({properties:{...properties,subject_b:properties.subject_a,content_version:String(Number(properties.content_version||'0')+1)}},null,2),event_properties:{...(previous.event_properties||{}),content_program:'spend_growth',content_record:'en'}};
}
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function previewHtml(template,properties){return template.replace(/{% if copy\.(\w+)(?: \| default\(false\))? %}([\s\S]*?){% endif %}/g,(_,key,block)=>properties[key]?block:'').replace(/{{\s*copy\.(\w+)\s*(?:\|\s*default\([^)]*\)\s*)?(?:\|\s*e\s*)?}}/g,(_,field)=>escapeHtml(properties[field])).replace(/{{\s*email\.unsubscribe\s*}}/g,'#preview').replace(/{%[\s\S]*?%}/g,'').replace(/<head[^>]*>/i,'<head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src https: data:; style-src \'unsafe-inline\';">');}
async function start(){
 const $=s=>document.querySelector(s),form=$('#publisher-form'),embedded=window.parent!==window;
 let base,template,previousWebhook={},appOrigin=null,initialized=false;
 const status=(message,error=false)=>{$('#publisher-status').textContent=message;$('#publisher-status').className=error?'error':'';};
 try{const responses=await Promise.all([fetch('./defaults.json').then(r=>r.json()).then(d=>[{item_id:'en',properties:d.properties}]),fetch('./template.html').then(r=>r.text()),fetch('./defaults.json').then(r=>r.json())]);base={...responses[2].properties,...responses[0].find(r=>r.item_id==='en').properties};template=responses[1];
 for(const recipe of responses[2].recipes.slice(0,3)){const button=document.createElement('button');button.type='button';button.dataset.image=recipe.image_url;button.setAttribute('aria-label','Use '+recipe.title+' image');const img=document.createElement('img');img.src=recipe.image_url;img.alt=recipe.title;button.append(img);button.onclick=()=>{form.elements.banner_image.value=recipe.image_url.startsWith('https://')?recipe.image_url:base.banner_image;update();};$('#image-choices').append(button);}
 }catch{status('Could not load the fixed template and content.',true);return;}
 const model=()=>{const result={...base,...Object.fromEntries(fields.map(k=>[k,form.elements[k].value])),...Object.fromEntries(toggles.map(k=>[k,form.elements[k].checked]))};result.subject_b=result.subject_a;return result;};
 function load(properties){base={...base,...properties};for(const k of fields)form.elements[k].value=base[k]??'';for(const k of toggles)form.elements[k].checked=Boolean(base[k]);update();}
 function update(){const m=model();$('#preview-subject-a').textContent=m.subject_a;$('#preview-preheader').textContent=m.preheader;for(const section of document.querySelectorAll('[data-section]'))section.hidden=!m[section.dataset.section];$('#publisher-preview').srcdoc=previewHtml(template,m);for(const b of document.querySelectorAll('[data-image]'))b.setAttribute('aria-pressed',String(b.dataset.image===m.banner_image));}
 load(base);$('#publish').disabled=false;form.addEventListener('input',update);form.addEventListener('change',update);for(const button of document.querySelectorAll('[data-cta-preset]'))button.onclick=()=>{const presets={offers:['See your offers','https://www.ica.se/erbjudanden/'],recipes:['Plan dinner','https://www.ica.se/recept/'],stores:['Find your store','https://www.ica.se/butiker/']};const [text,url]=presets[button.dataset.ctaPreset];form.elements.cta_text.value=text;form.elements.cta_url.value=url;update();};
 function download(){try{const webhook=buildWebhook(model(),previousWebhook),a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify({message_type:'widget_state',webhook,widget_state:{editor_version:1}},null,2)],{type:'application/json'}));a.href=url;a.download='ica-central-content-webhook.json';a.click();URL.revokeObjectURL(url);status('Configuration downloaded. API credentials are not included. Configure authentication in Bloomreach.');}catch(error){status(error.message,true);}}
 $('#download-webhook').onclick=download;
 $('#save-draft').onclick=()=>{try{validate(model());if(embedded){status('Use Done in Bloomreach to save this node configuration. Saving does not run the webhook.');return;}localStorage.setItem('ica-central-publisher-draft',JSON.stringify({fields:Object.fromEntries([...fields,...toggles].map(k=>[k,model()[k]]))}));status('Draft saved on this browser. The catalog has not changed.');}catch(error){status(error.message,true);}};
 if(!embedded){const draft=localStorage.getItem('ica-central-publisher-draft');if(draft){try{load(JSON.parse(draft).fields);status('Restored your browser draft. Publish when ready.');}catch{}}}
 form.onsubmit=event=>{event.preventDefault();status('Save this node in Bloomreach, then run its publishing scenario to update the catalog.');};
 if(!embedded){$('#mode').textContent='Hosted preview';$('#publish').hidden=true;$('#save-help').textContent='Preview and save a browser draft here. Inside Bloomreach, Done saves the webhook configuration; running the scenario updates the catalog.';}

 if(embedded){document.body.classList.add('embedded');$('#mode').textContent='Bloomreach widget';$('#publish').hidden=true;$('#save-draft').textContent='Check content';$('#download-webhook').hidden=true;$('#save-help').textContent='Use Done in Bloomreach to save these fields in the webhook node. Run the publishing scenario to update the central catalog. No customer emails are sent by this action.';
 window.addEventListener('message',event=>{if(event.source!==window.parent||!allowedOrigins.includes(event.origin))return;const message=event.data;if(!message||typeof message!=='object')return;
 if(message.message_type==='app_hello'){if(message.version!==1){status('Unsupported Bloomreach widget version: '+String(message.version),true);return;}appOrigin=event.origin;previousWebhook=message.webhook||{};try{if(previousWebhook.body)load(JSON.parse(previousWebhook.body).properties||{});initialized=true;window.parent.postMessage({message_type:'widget_initialized'},appOrigin);status('Connected. Edit content and use Done to save.');}catch(error){status('Could not restore this webhook: '+error.message,true);}}
 else if(message.message_type==='app_request_state'&&initialized&&event.origin===appOrigin){try{window.parent.postMessage({message_type:'widget_state',webhook:buildWebhook(model(),previousWebhook),widget_state:{editor_version:1}},appOrigin);status('Configuration returned to Bloomreach. The catalog updates when this webhook executes.');}catch(error){status(error.message,true);}}
 else if(message.message_type==='app_reject'){initialized=false;status('Bloomreach did not accept this widget protocol version.',true);}
 else if(message.message_type==='errors')status('Bloomreach could not save this configuration: '+JSON.stringify(message.errors),true);
 });for(const origin of allowedOrigins)window.parent.postMessage({message_type:'widget_hello',min_supported_version:1,max_supported_version:1},origin);
 }
}
if(typeof document!=='undefined')start();
