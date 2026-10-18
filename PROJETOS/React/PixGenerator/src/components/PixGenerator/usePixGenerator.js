import { useMemo, useState } from "react";
import PIX_CONFIG from "../../config/pixConfig";
import { buildPix, descriptionRoom, normalizeKey, validatePix } from "../../core";

const EMPTY_FORM = {
  keyType: PIX_CONFIG.DEFAULT_KEY_TYPE,
  key: "",
  name: "",
  city: "",
  amount: "",
  txid: "",
  description: "",
  singleUse: false,
};

/**
 * Estado do formulário + BR Code gerado ao vivo.
 *
 * O código é refeito a cada tecla (useMemo). Os erros só aparecem nos campos
 * em que a pessoa já mexeu ("touched"), para a tela não abrir cheia de vermelho.
 */
export default function usePixGenerator() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});

  const errors = useMemo(() => validatePix(form), [form]);
  const result = useMemo(
    () => (Object.keys(errors).length === 0 ? buildPix(form) : null),
    [form, errors]
  );

  // Chave no formato do BR Code (aparece embaixo do campo)
  const normalizedKey = useMemo(() => {
    try {
      return normalizeKey(form.keyType, form.key);
    } catch {
      return null;
    }
  }, [form.keyType, form.key]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const changeKeyType = (keyType) => {
    setForm((current) => ({ ...current, keyType, key: "" }));
    setTouched((current) => ({ ...current, key: false }));
  };

  const touch = (field) => setTouched((current) => ({ ...current, [field]: true }));

  const fillExample = () => {
    setForm({ ...EMPTY_FORM, ...PIX_CONFIG.EXAMPLE });
    setTouched({});
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setTouched({});
  };

  // Erro de um campo, só se ele já foi visitado
  const errorOf = (field) => (touched[field] ? errors[field] : undefined);

  return {
    form,
    result,
    errorOf,
    normalizedKey,
    descriptionMax: descriptionRoom(normalizedKey ?? ""),
    update,
    changeKeyType,
    touch,
    fillExample,
    reset,
  };
}
