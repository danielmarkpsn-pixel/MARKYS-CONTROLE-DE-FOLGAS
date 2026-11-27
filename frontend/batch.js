const batchTable=(target,headers,rows)=>{const root=document.querySelector(target);const t=document.createElement("table");for(const [i,row] of [headers,...rows].entries()){const tr=t.insertRow();for(const value of row){const cell=document.createElement(i===0?"th":"td");cell.textContent=value??"";tr.appendChild(cell);}}root.replaceChildren(t);};
var validatedFile=null;
function resetBatch(){validatedFile=null;document.querySelector("#batch-confirm").disabled=true;document.querySelector("#batch-status").textContent="";document.querySelector("#batch-errors").replaceChildren();document.querySelector("#batch-table").replaceChildren();}
function setEmployeeMode(batch){document.querySelector("#batch-import").classList.toggle("hidden",!batch);document.querySelector("#employee-form").classList.toggle("hidden",batch);document.querySelector("#batch-mode").classList.toggle("secondary",!batch);document.querySelector("#individual-mode").classList.toggle("secondary",batch);}
document.querySelector("#individual-mode").addEventListener("click",()=>setEmployeeMode(false));
document.querySelector("#batch-mode").addEventListener("click",()=>{setEmployeeMode(true);document.querySelector("#batch-import").scrollIntoView({block:"start",behavior:"smooth"});});
document.querySelector("#employee-edit-selected").addEventListener("click",()=>setEmployeeMode(false));
document.querySelector("#batch-file").addEventListener("change",resetBatch);
async function importBatch(confirm){
 const file=document.querySelector("#batch-file").files[0];if(!file||confirm&&file!==validatedFile)return;
 document.querySelector("#batch-preview").disabled=true;document.querySelector("#batch-confirm").disabled=true;document.querySelector("#batch-file").disabled=true;
 try{
 const response=await fetch("/api/employee-import?confirm="+confirm,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/octet-stream"},body:file});
 const data=await response.json();if(!response.ok)throw Error(data.detail||"Falha na importação");
 document.querySelector("#batch-status").textContent=confirm&&data.created?data.created+" funcionários cadastrados.":data.count+" válidos; "+data.errors.length+" erros. Prévia: até 100 registros.";
 document.querySelector("#batch-errors").replaceChildren(...data.errors.map(e=>{const p=document.createElement("p");p.className="error";p.textContent="Linha "+e.line+": "+e.message;return p;}));
 batchTable("#batch-table",["Nome","Nascimento","Categoria","Carga","Turno","Matrícula"],data.preview.map(p=>[p.name,p.birth_date,p.category,p.weekly_hours,p.shift,p.registration]));
 validatedFile=!confirm&&!data.errors.length&&data.count?file:null;
 if(data.created){document.querySelector("#batch-file").value="";if(typeof refresh==="function")await refresh();}
 }catch(e){validatedFile=null;document.querySelector("#batch-status").textContent=e.message;}
 finally{document.querySelector("#batch-preview").disabled=false;document.querySelector("#batch-file").disabled=false;document.querySelector("#batch-confirm").disabled=!validatedFile;}
}
document.querySelector("#batch-preview").addEventListener("click",()=>importBatch(false));
document.querySelector("#batch-confirm").addEventListener("click",()=>importBatch(true));

document.querySelector("#batch-download").addEventListener("click",async()=>{
 const status=document.querySelector("#batch-status");const button=document.querySelector("#batch-download");button.disabled=true;
 try{if(window.pywebview?.api?.save_employee_template){const result=await window.pywebview.api.save_employee_template();if(result.error)throw Error(result.error);status.textContent=result.saved?"Planilha salva em: "+result.path:"Download cancelado.";}
 else{const response=await fetch("/api/employee-import/template",{credentials:"same-origin"});if(!response.ok)throw Error("Não foi possível gerar a planilha ("+response.status+").");const url=URL.createObjectURL(await response.blob());const link=document.createElement("a");link.href=url;link.download="funcionarios-modelo.xlsx";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent="Download solicitado.";}}
 catch(e){status.textContent="Erro ao salvar a planilha: "+e.message;}finally{button.disabled=false;}
});
