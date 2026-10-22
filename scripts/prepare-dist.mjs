import {copyFileSync,mkdirSync} from "node:fs";
const dest=new URL("../dist/public/",import.meta.url);
mkdirSync(new URL("reports/",dest),{recursive:true});
for(const file of ["LICENSE","THIRD_PARTY_NOTICES.md"])copyFileSync(new URL(`../${file}`,import.meta.url),new URL(file,dest));
copyFileSync(new URL("../reports/report.schema.json",import.meta.url),new URL("reports/report.schema.json",dest));
