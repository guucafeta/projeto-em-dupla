#!/usr/bin/env bash
# Limpeza da etapa 1 da migração para React.
# Remove cópias antigas/duplicadas que o Docker NÃO usa (o Docker só serve front/ e back/).
#
#   ./limpeza-etapa1.sh              -> só LISTA o que seria removido (não apaga nada)
#   ./limpeza-etapa1.sh --executar   -> pede confirmação e remove com `git rm` (recuperável)
set -euo pipefail
cd "$(dirname "$0")"

# Cópias antigas na raiz (repositório da raiz)
RAIZ=(admin ts js css assets produtos index.html)
# Dentro de front/ (repositório próprio): cópia solta e JavaScript escrito à mão
FRONT=(css/js admin/assets/js/comum.js admin/assets/js/template-sidebar.js)

existentes_raiz=(); existentes_front=()
for p in "${RAIZ[@]}";  do [ -e "$p" ]       && existentes_raiz+=("$p");  done
for p in "${FRONT[@]}"; do [ -e "front/$p" ] && existentes_front+=("$p"); done

echo "Será removido (raiz do projeto):"
for p in "${existentes_raiz[@]}"; do
  printf "  %-34s %s arquivo(s)\n" "$p" "$(find "$p" -type f | wc -l)"
done
echo "Será removido (dentro de front/):"
for p in "${existentes_front[@]}"; do
  printf "  front/%-28s %s arquivo(s)\n" "$p" "$(find "front/$p" -type f | wc -l)"
done

if [ "${1:-}" != "--executar" ]; then
  echo; echo "Simulação: nada foi apagado. Rode com --executar para aplicar."; exit 0
fi

echo; read -r -p "Digite SIM para remover (faça commit/backup antes): " resposta
[ "$resposta" = "SIM" ] || { echo "Cancelado."; exit 1; }

remover() {  # remover <repositório> <caminho>
  local repo="$1" caminho="$2"
  if git -C "$repo" ls-files --error-unmatch -- "$caminho" >/dev/null 2>&1; then
    git -C "$repo" rm -r -q -- "$caminho" \
      || echo "  AVISO: $caminho tem alterações locais; não removido (resolva e rode de novo)."
  else
    rm -r -- "$repo/$caminho"
  fi
  # o git não remove pastas; apaga só as que ficaram VAZIAS
  [ -d "$repo/$caminho" ] && find "$repo/$caminho" -depth -type d -empty -delete
  return 0
}

for p in "${existentes_raiz[@]}";  do remover . "$p"; done
for p in "${existentes_front[@]}"; do remover front "$p"; done
echo "Pronto. Revise com 'git status' (raiz e front/) e faça o commit."
