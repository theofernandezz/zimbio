interface EmailContent {
  subject: string;
  html: string;
}

function wrapEmail(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="margin-bottom: 16px;">${title}</h2>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #888;">Zimbio</p>
    </div>
  `;
}

export function memberJoinedAdminEmail(
  groupName: string,
  newMemberName: string,
): EmailContent {
  return {
    subject: `${newMemberName} se sumó a ${groupName}`,
    html: wrapEmail(
      "Nuevo miembro en tu grupo",
      `<p><strong>${newMemberName}</strong> se sumó al grupo <strong>${groupName}</strong>.</p>`,
    ),
  };
}

export function memberJoinedParticipantEmail(
  groupName: string,
  newMemberName: string,
): EmailContent {
  return {
    subject: `${newMemberName} se sumó a ${groupName}`,
    html: wrapEmail(
      "Nuevo miembro en tu grupo",
      `<p><strong>${newMemberName}</strong> se sumó al grupo <strong>${groupName}</strong> del que formás parte.</p>`,
    ),
  };
}

export function memberLeftAdminEmail(
  groupName: string,
  memberName: string,
): EmailContent {
  return {
    subject: `${memberName} salió de ${groupName}`,
    html: wrapEmail(
      "Un miembro salió del grupo",
      `<p><strong>${memberName}</strong> salió del grupo <strong>${groupName}</strong>.</p>`,
    ),
  };
}

export function cycleRenewedAdminEmail(
  groupName: string,
  newCycle: string,
): EmailContent {
  return {
    subject: `Nuevo ciclo en ${groupName}: ${newCycle}`,
    html: wrapEmail(
      "Se renovó el ciclo mensual",
      `<p>El grupo <strong>${groupName}</strong> arrancó el ciclo <strong>${newCycle}</strong>. Los pagos de los miembros se reiniciaron.</p>`,
    ),
  };
}

export function cycleRenewedParticipantEmail(
  groupName: string,
  newCycle: string,
): EmailContent {
  return {
    subject: `Nuevo ciclo en ${groupName}: ${newCycle}`,
    html: wrapEmail(
      "Arrancó un nuevo mes",
      `<p>Tu grupo <strong>${groupName}</strong> arrancó el ciclo <strong>${newCycle}</strong>. Recordá registrar tu pago cuando corresponda.</p>`,
    ),
  };
}

export function paymentReminderAdminEmail(
  groupName: string,
  unpaidNames: string[],
  daysLeft: number,
): EmailContent {
  const list = unpaidNames.map((name) => `<li>${name}</li>`).join("");
  return {
    subject: `${groupName}: faltan ${daysLeft} días y hay pagos pendientes`,
    html: wrapEmail(
      "Recordatorio de cierre de mes",
      `<p>Faltan <strong>${daysLeft} días</strong> para que cierre el ciclo de <strong>${groupName}</strong> y los siguientes miembros todavía no pagaron:</p>
       <ul>${list}</ul>`,
    ),
  };
}
