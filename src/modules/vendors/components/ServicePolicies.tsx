import "./ServicePolicies.css";

type ServicePoliciesProps = {
  serviceName: string;
  category: string;
};

type PolicySection = {
  title: string;
  paragraphs: string[];
};

function policySections(serviceName: string, category: string): PolicySection[] {
  const normalizedCategory = category.toLowerCase();
  const isFlight = normalizedCategory.includes("flight");
  const isStay = normalizedCategory.includes("accommodation") || normalizedCategory.includes("hotel");

  const supplierRule = isFlight
    ? "the ticketed fare and the operating airline's rules"
    : isStay
      ? "the confirmed room plan and the property's rules"
      : "the confirmed supplier and rate-card rules";

  const operationalChange = isFlight
    ? "Flight schedules, baggage allowances, seat assignments and operating carriers may change under the airline's conditions of carriage."
    : isStay
      ? "Check-in times, room allocation, views and special requests remain subject to the property's final confirmation."
      : "Timings, operating sequences and supplier arrangements may change because of weather, local restrictions or operational conditions.";

  return [
    {
      title: "Cancellation",
      paragraphs: [
        `Cancellation of ${serviceName} is governed by ${supplierRule}. Any non-refundable deposit, ticketing fee, permit or supplier charge already incurred will be retained.`,
        "Requests must be sent in writing before the service start time. The effective cancellation date is when the agency acknowledges the request. A no-show, late cancellation or cancellation after the service has started may be charged at 100% of the confirmed value.",
        "When more than one vendor provides this service, the policy of the vendor and rate card selected on the confirmed booking applies.",
      ],
    },
    {
      title: "Refund",
      paragraphs: [
        "Where a refund is due, the amount will be calculated after deducting cancellation charges, supplier penalties, payment-processing costs, foreign-exchange differences and any service already delivered.",
        "Approved refunds will be returned to the original payment method after the agency receives the corresponding credit from the supplier. Processing normally takes 10–15 working days, although international suppliers may require additional time.",
      ],
    },
    {
      title: "Terms and conditions",
      paragraphs: [
        `${serviceName} is subject to availability and is not confirmed until the selected vendor accepts the booking. Rates, inclusions and validity are taken from the rate card attached to the final booking. A change in date, traveller count, service option or pickup details may result in a revised price.`,
        "Travellers are responsible for providing accurate names, contact details and any identification, visa, permit, insurance or health document required for the service. Details must match the travel documents used for the booking.",
        operationalChange,
        "Only the items expressly listed in the confirmed service and rate card are included. Personal expenses, optional upgrades, local charges and services purchased directly from the supplier are excluded unless stated otherwise.",
      ],
    },
  ];
}

export function ServicePolicies({ serviceName, category }: ServicePoliciesProps) {
  const sections = policySections(serviceName, category);

  return (
    <section className="service-policy-page" aria-label={`Policies for ${serviceName}`}>
      <article className="service-policy-document">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <div className="service-policy-document__copy">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </article>
    </section>
  );
}
