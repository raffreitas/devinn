# Convenção de Versionamento Semântico para PRs

Esta equipe usa uma convenção simples para indicar qual parte do SemVer deve ser incrementada quando um Pull Request for mesclado.

Como marcar a PR
- Inclua uma das tags no **título** ou no **corpo** da PR (case-insensitive):
  - `[Major]` — incrementa a versão major (X.0.0)
  - `[Minor]` — incrementa a versão minor (X.Y.0)
  - `[Patch]` — incrementa a versão patch (X.Y.Z)

Comportamento dos workflows
- `semver-pr-check.yaml` (check): valida quando a PR é criada/atualizada. Se nenhuma tag for encontrada, o workflow posta um comentário pedindo para adicionar `[Patch]`, `[Minor]` ou `[Major]` e falha — útil quando você usa branch protection rules que exigem o check.
- `semver-tagging.yaml` (tag & release): roda quando a PR é fechada e mesclada. Ele procura a tag mais recente do repositório no formato `vX.Y.Z`, calcula a próxima versão conforme a tag encontrada na PR e cria:
  - uma referência Git `refs/tags/vA.B.C` apontando para o commit de merge;
  - um GitHub Release com o mesmo nome `vA.B.C` e corpo com referência à PR.

Comportamento padrão
- Se a PR for mesclada sem marcar nada, o `semver-tagging.yaml` fará um incremento `patch` automaticamente (ou seja, vende-se à compatibilidade mínima caso o autor tenha esquecido de marcar).

Boas práticas
- Use `[Major]` apenas para mudanças que quebram a API/contrato público.
- Use `[Minor]` para novas funcionalidades compatíveis com versões anteriores.
- Use `[Patch]` para correções de bugs, documentação, e alterações internas.
- Coloque a tag no título da PR sempre que possível, por exemplo: `feat: adiciona busca avançada [Minor]`.

Exemplos
- Título: `fix: corrige cálculo de imposto [Patch]`
- Corpo: `Adiciona validação e corrige arredondamento. [Patch]`

Sugestões de proteção de branch
- Marcar o check `SemVer PR Check` como obrigatório em `main` impede merges sem indicar bump.

Se quiser que em vez de falhar o check ele apenas avise, edite `.github/workflows/semver-pr-check.yaml` e remova o `throw new Error(...)`, substituindo por um `core.setFailed()` opcionalmente não-erro (ou apenas um comentário).

Perguntas?
- Posso traduzir o comentário automático para outro tom ou atualizar o texto, se quiser.
