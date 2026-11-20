#!/usr/bin/env bash
# Limpeza da etapa 4 da migração para React.
# Remove o front-end antigo (HTML/CSS/TS/JS estático), já substituído por
# front/app (SPA React) e pelo Docker novo (etapa 4a). O Docker só usa
# front/app, front/assets e front/produtos — o resto abaixo não é mais servido.
#
#   ./limpeza-etapa4.sh              -> só LISTA o que seria removido (não apaga nada)
#   ./limpeza-etapa4.sh --executar   -> pede confirmação e remove com `git rm` (recuperável)
set -euo pipefail
cd "$(dirname "$0")"

# Tudo dentro de front/ (repositório próprio), exceto front/app, front/assets
# e front/produtos, que continuam em uso.
FRONT=(admin cliente css js ts index.html)

existentes_front=()
for p in "${FRONT[@]}"; do [ -e "front/$p" ] && existentes_front+=("$p"); done

echo "Será removido (dentro de front/):"
for p in "${existentes_front[@]}"; do
  printf "  front/%-28s %s arquivo(s)\n" "$p" "$(find "front/$p" -type f | wc -l)"
done

if [ "${1:-}" != "--executar" ]; then
  echo; echo "Simulação: nada foi apagado. Rode com --executar para aplicar."; exit 0
fi

echo
echo "Atenção: alterações locais NÃO commitadas nesses arquivos antigos também serão"
echo "descartadas (eles foram substituídos por front/app e não são mais usados)."
read -r -p "Digite SIM para remover (faça commit/backup antes): " resposta
[ "$resposta" = "SIM" ] || { echo "Cancelado."; exit 1; }

remover() {  # remover <repositório> <caminho>
  local repo="$1" caminho="$2"
  if git -C "$repo" ls-files --error-unmatch -- "$caminho" >/dev/null 2>&1; then
    # -f: remove mesmo com alterações locais (arquivos obsoletos, confirmado acima).
    # A versão commitada continua no histórico do git.
    git -C "$repo" rm -r -f -q -- "$caminho"
  fi
  # Sobras fora do controle do git (arquivos novos ou já tirados do índice).
  [ -e "$repo/$caminho" ] && rm -r -- "$repo/$caminho"
  return 0
}

for p in "${existentes_front[@]}"; do remover front "$p"; done
echo "Pronto. Revise com 'git status' (dentro de front/) e faça o commit."
echo "Depois, suba de novo com: docker compose up --build -d"
