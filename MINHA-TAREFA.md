# Minha tarefa — DevOps e Tech Forge

Esta branch contém somente os arquivos atribuídos a **DevOps** e **Tech Forge**. Não inclui as implementações de front-end ou back-end atribuídas ao outro integrante.

## DevOps — aplicar no repositório principal

Os arquivos abaixo já estão nos locais de destino em `projeto-em-dupla`:

- `.env.example` — modelo de ambiente com `JWT_SECRET`, sem credenciais reais.
- `.gitignore` — proteção de arquivos locais e manutenção de front/back como projetos separados.
- `docker-compose.yml` — serviços, volumes, redes, variáveis e migrações necessárias.
- `LEIA-ME.md` — instruções para montar e testar os três repositórios.

O arquivo `docker/nginx/default.conf` existente foi mantido, pois não precisou de correção.

## DevOps — arquivo destinado ao boardpoint-back

- `devops/boardpoint-back/docker/Dockerfile`

Quando for integrar, copie esse arquivo para `boardpoint-back/docker/Dockerfile`. Ele acrescenta a extensão `mbstring`, necessária às validações PHP, sem alterar a responsabilidade das APIs.

## Tech Forge — arquivos destinados ao boardpoint-front

A pasta `tech-forge/boardpoint-front/` é apenas uma área de organização desta entrega. Na integração, copie o **conteúdo** dela para a raiz de `boardpoint-front`.

Arquivos incluídos:

- `ts/tsconfig.json` — corrige a saída da compilação para `js/`.
- `ts/tipos/Tipos.ts` — contratos e tipagens, incluindo os dados de paginação.
- `ts/repositorios/RepositorioCategorias.ts` — acesso à API com o padrão de repositório.
- `ts/repositorios/RepositorioProdutos.ts` — repositório tipado e busca paginada completa.
- `ts/servicos/ServicoContato.ts` — serviço com responsabilidade única.
- `ts/servicos/ServicoPedido.ts` — serviço de pedidos desacoplado da interface.
- `ts/app/componentes/Paginacao.ts` — componente genérico com estado encapsulado.

Estes arquivos se relacionam com Generics, interfaces, abstração, responsabilidade única, desacoplamento e organização do TypeScript.

As classes de `ts/entidades/`, `ts/excecoes/` e `ts/servicos/metricas/` já estavam adequadas e não foram substituídas.

## Integração

1. Integre primeiro as partes de front-end e back-end do outro integrante.
2. Copie os arquivos de `devops/boardpoint-back/` e `tech-forge/boardpoint-front/` para os destinos indicados.
3. No repositório `boardpoint-front`, execute `tsc -p ts` para gerar todo o JavaScript.
4. Configure o ambiente local usando `.env.example`, sem versionar o arquivo real.
5. Monte `front/` e `back/` na estrutura documentada e execute `docker compose up --build -d`.

As correções de DevOps dependem dos arquivos de front-end e back-end do outro integrante. Por isso, o teste completo deve ser feito somente após a integração das duas partes.
