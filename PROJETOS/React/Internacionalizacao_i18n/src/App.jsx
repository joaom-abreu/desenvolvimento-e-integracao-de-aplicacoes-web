import { useTranslation } from "react-i18next";
import { SiI18Next } from "react-icons/si";
import I18nDemo from "./components/I18nDemo/I18nDemo";
import LanguageSwitcher from "./components/LanguageSwitcher/LanguageSwitcher";
import PageLayout from "./components/PageLayout/PageLayout";

function App() {
  // useTranslation() faz o App renderizar de novo quando o idioma muda
  const { t } = useTranslation();

  return (
    <PageLayout
      icon={SiI18Next}
      brand={t("layout.brand")}
      label={t("layout.label")}
      title={t("layout.title")}
      description={t("layout.description")}
      footer={t("layout.footer")}
      pucAlt={t("layout.pucLogo")}
      actions={<LanguageSwitcher />}
    >
      <I18nDemo />
    </PageLayout>
  );
}

export default App;
