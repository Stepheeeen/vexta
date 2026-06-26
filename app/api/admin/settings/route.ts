import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        lastDailyRun: null,
        maintenanceMode: false,
        newRegistrations: true,
        twoFactorRequired: false,
        referralRate: 15.0,
        tradingFee: 2.0,
        withdrawalFee: 6.0,
        liquidityBonus: 0,
        depositGatewayOpen: true,
        depositPromosActive: true,
        withdrawalGatewayState: 'auto',
        promoCampaignActive: true,
        promoDuration: 40,
        promoDailyROI: 1.0,
        promoNoBonus: true,
      },
    });
  }
  return settings;
}

export async function GET(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await getOrCreateSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[admin-settings-get]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getUserFromRequest(req);
    if (!userPayload || userPayload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const settings = await getOrCreateSettings();

    const dataToUpdate: any = {};
    if (typeof body.maintenanceMode === 'boolean') dataToUpdate.maintenanceMode = body.maintenanceMode;
    if (typeof body.newRegistrations === 'boolean') dataToUpdate.newRegistrations = body.newRegistrations;
    if (typeof body.twoFactorRequired === 'boolean') dataToUpdate.twoFactorRequired = body.twoFactorRequired;

    // Parse fee rates/commissions as numbers
    if (body.referralRate !== undefined) dataToUpdate.referralRate = Number(body.referralRate);
    if (body.tradingFee !== undefined) dataToUpdate.tradingFee = Number(body.tradingFee);
    if (body.withdrawalFee !== undefined) dataToUpdate.withdrawalFee = Number(body.withdrawalFee);

    // Liquidity volume bonus
    if (body.liquidityBonus !== undefined) dataToUpdate.liquidityBonus = Number(body.liquidityBonus);

    // Deposit gateway & Promotional campaign settings
    if (typeof body.depositGatewayOpen === 'boolean') dataToUpdate.depositGatewayOpen = body.depositGatewayOpen;
    if (typeof body.depositPromosActive === 'boolean') dataToUpdate.depositPromosActive = body.depositPromosActive;
    if (body.withdrawalGatewayState !== undefined) dataToUpdate.withdrawalGatewayState = String(body.withdrawalGatewayState);
    if (typeof body.promoCampaignActive === 'boolean') dataToUpdate.promoCampaignActive = body.promoCampaignActive;
    if (body.promoDuration !== undefined) dataToUpdate.promoDuration = Number(body.promoDuration);
    if (body.promoDailyROI !== undefined) dataToUpdate.promoDailyROI = Number(body.promoDailyROI);
    if (typeof body.promoNoBonus === 'boolean') dataToUpdate.promoNoBonus = body.promoNoBonus;

    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings: updated });
  } catch (err) {
    console.error('[admin-settings-post]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
