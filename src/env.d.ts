/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly DEPLOYMENT_STAGE?: string;
  readonly PUBLIC_INDEXING_ENABLED?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_ENABLE_ADS?: string;
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOT_ARTICLE?: string;
  readonly PUBLIC_ADSENSE_SLOT_SIDEBAR?: string;
  readonly ADS_TXT_LINE?: string;
  readonly PUBLIC_ENABLE_ANALYTICS?: string;
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_CONSENT_PROVIDER?: string;
  readonly VERCEL_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
