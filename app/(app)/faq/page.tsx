import { HelpCircle, Users, CreditCard, KeyRound, ShieldCheck, RefreshCw, LogOut, UserPlus } from "lucide-react";

const FAQS = [
  {
    category: "Primeros pasos",
    icon: UserPlus,
    items: [
      {
        q: "¿Qué es Zimbio?",
        a: "Zimbio es una app para gestionar suscripciones digitales compartidas (Netflix, Spotify, Disney+, etc.) en grupo. Te permite dividir los costos automáticamente, llevar el control de quién pagó y compartir las credenciales de forma segura.",
      },
      {
        q: "¿Cómo creo un grupo?",
        a: 'Desde la sección "Grupos", tocá el botón "+ Crear grupo". Elegí el servicio, el plan, la cantidad de miembros y tu método de cobro (alias o CVU). Una vez creado, vas a recibir un link de invitación para compartir con tus compañeros.',
      },
      {
        q: "¿Cómo me uno a un grupo?",
        a: 'Necesitás que el administrador del grupo te comparta el link de invitación. Al abrirlo, vas a ver los detalles del grupo y podés aceptar la invitación. También podés ingresar el link desde el botón "Unirme con link" en la pantalla de Grupos.',
      },
    ],
  },
  {
    category: "Pagos y cobros",
    icon: CreditCard,
    items: [
      {
        q: "¿Cómo funciona el sistema de pagos?",
        a: "Zimbio no procesa pagos directamente. Lo que hace es calcular cuánto le corresponde pagar a cada miembro y mostrarle el alias o CVU del administrador para que transfiera por su cuenta (Mercado Pago o transferencia bancaria). Una vez que transferiste, marcás el pago como realizado y el admin lo confirma.",
      },
      {
        q: "¿Cómo se calcula lo que tengo que pagar?",
        a: "El administrador ingresa el total mensual del servicio (con IVA incluido) y Zimbio lo divide en partes iguales entre todos los miembros. El cálculo ya tiene en cuenta el IVA del 21% que aplica a los servicios digitales en Argentina.",
      },
      {
        q: "¿Qué pasa si no pago en el mes?",
        a: "Tu estado queda como Pendiente y el administrador puede enviarte un recordatorio por WhatsApp directamente desde la app. No hay penalidades automáticas, pero el admin puede decidir sacarte del grupo si no regularizás.",
      },
      {
        q: "¿Cómo funciona el ciclo de cobro?",
        a: 'Cada ciclo dura un mes. Cuando empieza un nuevo mes, el administrador inicia un nuevo ciclo desde el botón "Nuevo ciclo" y todos los miembros vuelven a quedar con estado Pendiente. Los pagos del mes anterior quedan registrados.',
      },
    ],
  },
  {
    category: "Grupos y miembros",
    icon: Users,
    items: [
      {
        q: "¿Puedo estar en más de un grupo?",
        a: "Sí. Podés ser administrador de varios grupos y al mismo tiempo participante de otros. Todos tus grupos aparecen en la pantalla principal separados por rol.",
      },
      {
        q: "¿Puedo salirme de un grupo?",
        a: 'Sí, desde el dashboard del grupo como participante encontrás el botón "Salir del grupo" al final de la página. Tené en cuenta que si ya realizaste el pago del mes, no se te va a reembolsar lo abonado.',
      },
      {
        q: "¿El administrador puede sacarme del grupo?",
        a: "Sí, el administrador puede expulsar miembros desde el dashboard. Sin embargo, no puede sacarte si ya pagaste el mes en curso — en ese caso tiene que esperar a que se renueve el ciclo.",
      },
    ],
  },
  {
    category: "Credenciales y seguridad",
    icon: KeyRound,
    items: [
      {
        q: "¿Cómo funciona el vault de credenciales?",
        a: 'El administrador puede cargar el usuario y contraseña del servicio en la sección "Accesos". Esas credenciales se guardan cifradas con AES-256 y solo los miembros activos del grupo pueden verlas.',
      },
      {
        q: "¿Es seguro guardar contraseñas en Zimbio?",
        a: "Las credenciales se almacenan cifradas en la base de datos con AES-256-GCM, un estándar de cifrado de grado militar. Ni siquiera el equipo de Zimbio puede leer tus contraseñas en texto plano.",
      },
    ],
  },
  {
    category: "Impuestos",
    icon: ShieldCheck,
    items: [
      {
        q: "¿Por qué el precio es más alto que el que figura en la web del servicio?",
        a: "Los servicios digitales extranjeros en Argentina tienen un IVA del 21% que se aplica al pagar con tarjeta. Zimbio muestra siempre el precio final con impuestos incluidos para que no haya sorpresas. Los precios de referencia se toman de impuestito.org.",
      },
      {
        q: "¿Qué impuestos aplican?",
        a: "Actualmente solo aplica el IVA del 21%. El impuesto PAIS y la percepción de Ganancias fueron eliminados en 2024, por lo que ya no se incluyen en el cálculo.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-11 rounded-xl bg-primary/10">
          <HelpCircle className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Preguntas frecuentes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Todo lo que necesitás saber sobre Zimbio
          </p>
        </div>
      </div>

      {/* FAQ sections */}
      {FAQS.map(({ category, icon: Icon, items }) => (
        <section key={category} className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border">
            <Icon className="size-4 text-primary shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {category}
            </h2>
          </div>
          <div className="space-y-3">
            {items.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-border bg-card px-5 py-4 space-y-2"
              >
                <p className="font-semibold text-foreground">{q}</p>
                <p className="text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Footer note */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 px-5 py-4">
        <RefreshCw className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          Los precios de los servicios cambian con frecuencia. El administrador del grupo puede actualizarlos manualmente desde el dashboard usando los valores de{" "}
          <a
            href="https://www.impuestito.org/suscripciones"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline underline-offset-2"
          >
            impuestito.org
          </a>
          .
        </p>
      </div>

    </div>
  );
}
