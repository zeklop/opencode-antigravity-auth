import { pathToFileURL } from "node:url";
import { checkAccountsQuota, type AccountQuotaResult } from "./plugin/quota";
import { renderQuotaReport } from "./plugin/quota-report";
import { loadAccounts, type AccountMetadataV3, type AccountStorageV4 } from "./plugin/storage";
import type { PluginClient } from "./plugin/types";

type LoadAccounts = () => Promise<AccountStorageV4 | null>;
type CheckQuota = (accounts: AccountMetadataV3[]) => Promise<AccountQuotaResult[]>;

export interface QuotaCliDependencies {
  now: () => number;
  loadAccounts: LoadAccounts;
  checkQuota: CheckQuota;
  write: (message: string) => void;
  writeError: (message: string) => void;
}

const quotaClient = {} as PluginClient;

const defaultDependencies: QuotaCliDependencies = {
  now: () => Date.now(),
  loadAccounts,
  checkQuota: (accounts) => checkAccountsQuota(accounts, quotaClient),
  write: (message) => {
    process.stdout.write(message);
  },
  writeError: (message) => {
    process.stderr.write(message);
  },
};

export async function runQuotaCli(
  overrides: Partial<QuotaCliDependencies> = {},
): Promise<number> {
  const dependencies = { ...defaultDependencies, ...overrides };
  const storage = await dependencies.loadAccounts();

  if (!storage || storage.accounts.length === 0) {
    dependencies.writeError("gquota: no plugin OAuth accounts found\n");
    return 1;
  }

  const results = await dependencies.checkQuota(storage.accounts);
  dependencies.write(`${renderQuotaReport(storage, results, dependencies.now())}\n`);
  return 0;
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  return Boolean(entry && import.meta.url === pathToFileURL(entry).href);
}

if (isDirectRun()) {
  runQuotaCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`gquota: ${message}\n`);
      process.exitCode = 1;
    });
}
