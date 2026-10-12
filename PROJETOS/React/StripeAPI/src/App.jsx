import { SiStripe } from "react-icons/si";
import PageLayout from "./components/PageLayout/PageLayout";
import StripeCheckout from "./components/StripeCheckout/StripeCheckout";

function App() {
  return (
    <PageLayout
      icon={SiStripe}
      brand="Stripe API"
      title="Pagamento com cartão"
      description="Um checkout de exemplo com a Stripe em modo de teste: escolha os itens, pague com um cartão de teste e veja o recibo. Nenhum valor é cobrado de verdade."
    >
      <StripeCheckout
        onPaymentSuccess={(payment) => console.log("Pagamento aprovado:", payment.id)}
      />
    </PageLayout>
  );
}

export default App;
