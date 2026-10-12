import { Link } from "react-router-dom";
import { TbRobot } from "react-icons/tb";
import PageLayout from "../components/PageLayout/PageLayout";

const NotFound = () => (
  <PageLayout
    icon={TbRobot}
    brand="Captcha"
    title="Página não encontrada"
    description="Este endereço não existe. Volte para a lista de captchas."
  >
    <title>Página não encontrada | Projeto Captcha</title>
    <p style={{ textAlign: "center" }}>
      <Link to="/">← Todos os captchas</Link>
    </p>
  </PageLayout>
);

export default NotFound;
