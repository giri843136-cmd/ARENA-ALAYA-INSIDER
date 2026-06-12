/**
 * Marketplace-specific SDK methods (extends core client)
 */

import { AlayaClient } from './client';

declare module './client' {
  interface AlayaClient {
    submitToMarketplace(data: any): Promise<any>;
    getMarketplaceListing(id: string): Promise<any>;
  }
}

AlayaClient.prototype.submitToMarketplace = async function (data: any) {
  return this.request('/marketplace/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
