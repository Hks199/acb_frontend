import React from 'react';

const ReturnRefund = () => {
  return (
    <div className="bg-[#fffafa] min-h-screen text-gray-800 px-4 py-10 md:px-12 lg:px-28 max-w-screen-2xl mx-auto leading-relaxed">
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-4xl font-bold text-[#F75E69] mb-2">Cancellation, Return & Exchange Policy</h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Kindly read the policy below carefully before requesting a cancellation, return, or exchange.
        </p>
      </div>

      <div className="space-y-7">

        {/* Cancellation Policy */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">Cancellation Policy</h2>
          <div className="space-y-4 text-sm md:text-base">
            <p>You can cancel orders for Products partially or fully prior to the orders of Products being packed and invoice generated in relation thereof.</p>
            <p>
              Upon successfully placing an order for Products on the Platforms and after we have successfully handed over the Product(s) to its Logistic Partner, in case you change your mind in relation to a particular order of the Products (including instances of tampered/torn/opened Product packages at the time of delivery of Product), you may reject the shipment of such order of Products when our Logistic Partner attempts the delivery the order of Products at your address. For any help that you may need you can always reach out to us at website or via Contact Us section on the Platforms.
            </p>
            <p>
              On receipt of the cancellation request prior to Products being packed and invoice being generated we shall cancel the order of Products and initiate the refund for the Products within <strong>10 (ten) business days</strong> from the receipt of the cancellation request from you. The amount shall be refunded to you through the same mode of payment used by you for purchases of Products on the Platforms. 
            </p>
            <p>
              The User is not allowed to cancel the order for Products after the Products have been packed and invoice has been generated in relation thereof. If any User sends an email to us requesting for cancellation of the order for Products after the Products have been packed and invoice has been generated in relation thereof, we cannot guarantee such order cancellation in case the Product is already packed and invoiced by the time we check and respond to User’s email. In such cases, the User may choose to refuse to accept the delivery of the order of Products when our Logistic Partner attempts the delivery the order of Products at User’s address and let unwanted order of Products be returned to us by our Logistic Partner.
            </p>
            <p>
              If at the time of delivery of order of Products by our Logistic Partner the User notices or is aware that the Product package is either tampered and/or torn and/or open then the User may reject the shipment of such order of Products when our Logistic Partner attempts to deliver the order of Products at the User’s address and intimate the concern by emailing our website or contacting us via Contact Us section on the Platforms.
            </p>
          </div>
        </section>

        {/* Return Policy */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">Return Policy</h2>
          <div className="space-y-4 text-sm md:text-base">
            <p>Return and exchange is available for selected products only. It is subjected to the category-wise products.</p>
            <p>Right now, we do not have pickup service available at your location, you would have to self-ship the product to our office address.</p>
            <p>Refund will be initiated after 24 to 48 hours once the product is received.</p>

            <p>you may initiate the request for return of the Product if: </p>
            <ul className="list-disc list-inside ml-4">
              <li>(i) Product is damaged;</li>
              <li>(ii) both the Product and shipping package have been damaged;</li>
              <li>(iii) Product is defective or is not in working condition;</li>
              <li>(iv) the Product is of bad quality;</li>
              <li>(v) parts of the Product or accessory is missing;</li>
              <li>(vi) the Product ordered is different from what was ordered basis the Product description provided on the Platforms;</li>
              <li>(vii) you are dissatisfied with the quality of purchased Product due to size issue, fit issue, colour issue, manufacturing defects, shrinkage in fabric.</li>
            </ul>

            <p>While raising a request for return on the Platforms, the User shall have the option to seek a refund of the money paid by him/her towards the purchase of the Product.</p>

            <p>The User shall ensure that the Products being returned comply with the conditions set out under this Policy and are, among other conditions:</p>
            <ul className="list-disc list-inside ml-4">
              <li>unused,</li>
              <li>unwashed,</li>
              <li>with price tags intact,</li>
              <li>all packaging material undamaged and unused,</li>
              <li>should not carry stains, sweat, detergent, or body odour.</li>
            </ul>

            <p>
              You shall keep the Products in its unused, original condition, along with the original invoice/ sale receipt, brand outer box, MRP tags attached, user manual, warranty cards, and original accessories in manufacturer packaging for a successful return pick-up. 
            </p>
            <p>
              In case we find that the returned Products does not meet the criteria mentioned under this Policy, we reserve the right to reject the return Products and refuse refunds in relation thereof.
            </p>

            <p>
              If you have received any Product which is subject to return in terms of this Policy, we suggest you to immediately register a request in this regard on the concerned Platform. We will in our sole discretion verify if:
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>(a) the defects and damages in the Products or the non-compliances claimed in such Products are acceptable by us, or</li>
              <li>(b) such defects, damages or non-compliances are due to our default,</li>
            </ul>
            <p>and will accordingly post verification, accept or reject the request for return of the Products.</p>

            <p>
              For such verification, we may request you to send us images of the damaged, defective or Non-Compliant Products received and/or allow our personnel to schedule a visit to assess the damage, defect or non-compliance in the Product. Further to the assessment, we may resolve the issue subject to the assessment report. You agree that our decision is final and binding.
            </p>

            <p>You agree that we will not accept the return of any Product:</p>
            <ul className="list-disc list-inside ml-4">
              <li>if you have placed the order for a wrong product model, colour or incorrect Product.</li>
              <li>if the Product belongs to Non-Returnable Products.</li>
              <li>if you fail to request return/register a complaint within the Return Period.</li>
            </ul>

            <p>You agree that we will not accept the exchange of any Product:</p>
            <ul className="list-disc list-inside ml-4">
              <li>if you have placed the order for a wrong product model, colour or incorrect Product.</li>
              <li>if the Product belongs to Non-Returnable Product category (e.g. personalised Products).</li>
              <li>if you fail to request exchange/register a complaint within the Exchange Period.</li>
            </ul>

            <p>
              Made to Order’ Products: Any damage due to improper wearing, modification, or depreciation will not be eligible for exchange. Any decision by us in this regard shall be final.
            </p>
          </div>
        </section>

        {/* Exchange Policy */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">Exchange Policy</h2>
          <p>You can exchange the Product(s), purchased from us provided the Product(s) satisfy below mandatory conditions:</p>
          <ul className="list-disc list-inside ml-4 mt-3 text-sm md:text-base space-y-1">
            <li>(i) The Product has not been worn, washed, cleaned or tampered with by you.</li>
            <li>(ii) The price tag /bar code, brand tags, original packaging material, including brand boxes and protective coverage accompanying accessories is intact and not altered, damaged or discarded by you.</li>
            <li>(iii) The accessories delivered with the are returned along with the Product, in an undamaged or unaltered condition.</li>
            <li>(iv) The Product is not altered, unless proven vendor defect.</li>
            <li>(v) There is no foul odour, perfume, stains, dents, scratches, tears or damage on the Product.</li>
            <li>(vi) The Product(s) if bought as a set should be exchanged as the complete set.</li>
            <li>(vii) Products returned for exchange should be in unused, undamaged, unwashed and in a saleable condition.</li>
            <li>(viii) We are satisfied that the Product has not been rendered defective or unusable.</li>
            <li>(ix) User has not breached any terms of this Policy.</li>
          </ul>
          <p className="mt-3">We reserve the right to reject the exchange request for a Product if it does not satisfy the aforementioned conditions.</p>
          <p className="mt-2">Exchange of purchased Products are facilitated through our reverse-logistics partners. On receipt of request for exchange of Product and the same being duly acknowledged by us, our reverse-logistics partners may get in touch with you in order to collect the purchased Products from you.</p>
        </section>

        {/* Customer Support */}
        <section className="bg-white shadow-md rounded-2xl p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">Customer Support</h2>
          <p className="text-sm md:text-base">
            Any queries or concerns relating to the return, refund and cancellation may be directed by you to our customer support team who can be contacted at:
          </p>
          <p className="mt-3 text-[#F75E69] font-medium">
            📧 <a href="mailto:artandcraftfrombharat@gmail.com" className="underline">artandcraftfrombharat@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnRefund;


/*
const ReturnRefund = () => {
  return (
    <div className="bg-[#fffafa] min-h-screen text-gray-800 px-4 py-10 md:px-12 lg:px-28 max-w-screen-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-4xl font-bold text-[#F75E69] mb-2">Return, Refund & Cancellation Policy</h1>
        <p className="text-gray-600 text-base max-w-2xl mx-auto">
          Please read the policy carefully before initiating any return, exchange or cancellation request.
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-white shadow-md rounded-lg p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">🛑 Cancellation Policy</h2>
          <ul className="list-disc list-inside space-y-3 text-sm md:text-base">
            <li>Orders can be cancelled before they are packed and invoiced.</li>
            <li>If the order is already shipped, you can reject it at delivery time.</li>
            <li>Refunds will be processed within <strong>10 business days</strong> to your original payment method.</li>
            <li>Once packed and invoiced, cancellations are not guaranteed.</li>
            <li>If packaging is tampered or open, you can refuse delivery and contact support immediately.</li>
          </ul>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">↩️ Return Policy</h2>
          <ul className="list-disc list-inside space-y-3 text-sm md:text-base">
            <li>Available only for selected products and categories.</li>
            <li>No pickup service — self-shipping required to our office address.</li>
            <li>Refund is initiated within <strong>24–48 hours</strong> after receiving the returned product.</li>
            <li>Return accepted in the following cases:
              <ul className="ml-5 list-disc space-y-1">
                <li>Product or packaging is damaged</li>
                <li>Product is defective or not working</li>
                <li>Wrong item received</li>
                <li>Size, fit, color or manufacturing issue</li>
              </ul>
            </li>
            <li>Products must be:
              <ul className="ml-5 list-disc space-y-1">
                <li>Unused, unwashed, and clean</li>
                <li>With tags, packaging, and invoice intact</li>
              </ul>
            </li>
            <li>Return may be rejected if the product does not meet the above conditions.</li>
          </ul>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">🔄 Exchange Policy</h2>
          <ul className="list-disc list-inside space-y-3 text-sm md:text-base">
            <li>Allowed if:
              <ul className="ml-5 list-disc space-y-1">
                <li>Product is unused, clean, and untampered</li>
                <li>All tags, packaging, and accessories are intact</li>
                <li>No stains, tears, odors, or damage</li>
                <li>Items bought as sets must be exchanged together</li>
              </ul>
            </li>
            <li>Exchange is coordinated through our reverse-logistics partners.</li>
            <li>We reserve the right to decline exchange if conditions are not met.</li>
          </ul>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">🚫 Not Eligible for Return/Exchange</h2>
          <ul className="list-disc list-inside space-y-3 text-sm md:text-base">
            <li>Wrong model or color ordered by customer</li>
            <li>Personalized or non-returnable category products</li>
            <li>Request made after return/exchange window</li>
            <li>Damage due to personal use or mishandling</li>
          </ul>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6 md:p-10 border border-[#fcdcdc]">
          <h2 className="text-2xl font-semibold text-[#F75E69] mb-4">📞 Customer Support</h2>
          <p className="text-sm md:text-base">
            For any return, refund, or cancellation queries, feel free to reach out to us:
          </p>
          <p className="mt-3 text-[#F75E69] font-medium text-sm md:text-base">
            📧 <a href="mailto:artandcraftfrombharat@gmail.com" className="underline">artandcraftfrombharat@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnRefund;
*/