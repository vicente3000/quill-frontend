import { USE_STUBS } from './stub-mode';
import * as realServices from './real-api-service';
import * as stubbedServices from './stubbed-api-service';

const services = USE_STUBS ? stubbedServices : realServices;

export const authService = services.authService;
export const portfolioService = services.portfolioService;
export const marketService = services.marketService;
export const ordersService = services.ordersService;
export const tradesService = services.tradesService;
export const usersService = services.usersService;
export const currencyService = services.currencyService;
export const adminConfigService = services.adminConfigService;
export const adminStockService = services.adminStockService;
export const adminContestService = services.adminContestService;
export const contestsService = services.contestsService;
