import LinkError from "../components/LinkError/LinkError";

/** Qualquer caminho que não seja "/" nem "/:shortUrl" (ex.: /a/b/c). */
const NotFound = () => <LinkError tipo="nao-encontrado" />;

export default NotFound;
