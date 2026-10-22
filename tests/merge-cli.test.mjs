import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,copyFileSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {hash} from "../scripts/catalog-lib.mjs";

test("CLI dry-run, guarded apply and replay prevention work in an isolated clone",()=>{
 const root=mkdtempSync(join(tmpdir(),"panoramix-merge-test-"));
 try{
  for(const dir of ["scripts","client/public","reports/examples"])mkdirSync(join(root,dir),{recursive:true});
  for(const file of ["scripts/catalog-lib.mjs","scripts/merge-reports.mjs","client/public/catalog.json","reports/examples/example-report.json"])copyFileSync(new URL(`../${file}`,import.meta.url),join(root,file));
  const catalog=join(root,"client/public/catalog.json");
  const before=readFileSync(catalog,"utf8"),digest=hash(before),script=join(root,"scripts/merge-reports.mjs"),report=join(root,"reports/examples/example-report.json");
  const run=(...args)=>spawnSync(process.execPath,[script,"--report",report,...args],{encoding:"utf8",cwd:root});
  const dry=run("--dry-run");assert.equal(dry.status,0,dry.stderr);assert.equal(readFileSync(catalog,"utf8"),before);assert.match(dry.stdout,/No files changed/);
  const denied=run("--apply","--expect-hash","wrong-hash");assert.notEqual(denied.status,0);assert.equal(readFileSync(catalog,"utf8"),before);
  const applied=run("--apply","--expect-hash",digest);assert.equal(applied.status,0,applied.stderr);
  assert.match(readFileSync(catalog,"utf8"),/example-groq-docs-review/);
  const replay=run("--dry-run");assert.notEqual(replay.status,0);assert.match(replay.stderr,/already been merged/);
 }finally{rmSync(root,{recursive:true,force:true})}
});
