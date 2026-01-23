# Estratégia de Tags (Manual) — SemVer

Este documento define como criar e manter tags de release manualmente usando a convenção SemVer (Semantic Versioning) sem integração automática com CI/GitHub Actions.

Objetivo
- Padronizar o versionamento e o processo de publicar releases manuais.
- Garantir rastreabilidade entre commits e versões.

1. Convenção de versionamento (SemVer)
- Formato: vMAJOR.MINOR.PATCH (ex.: v1.2.3)
  - MAJOR: mudanças incompatíveis na API/arquitetura (breaking changes)
  - MINOR: funcionalidades novas compatíveis com versões anteriores
  - PATCH: correções de bugs e pequenas melhorias
- Pré-releases: use identificadores de pré-lançamento conforme SemVer, ex.: v1.3.0-rc.1, v2.0.0-beta.2

2. Nomes de tags
- Use o prefixo `v` seguido do número SemVer: v1.2.3
- Para candidatas (release candidates): v1.2.0-rc.1
- Evite tags com formatos ambíguos; mantenha consistência em todo o repositório.

3. Fluxo manual de release (passo a passo)
Checklist antes de taggear:
- Código já mergeado na branch de release (por exemplo `main` ou `release`)
- Todos os testes relevantes executados e aprovados localmente
- Versões em arquivos (package.json, csproj, etc.) atualizadas conforme necessário

Passo a passo detalhado (ao finalizar alterações):
1. Finalizar alterações e preparar commit
   - Garanta que todas as mudanças estejam commitadas na branch de release (ex.: main):
     git add . && git commit -m "chore(release): prepare v1.2.3" 
   - Se já existir um commit com a preparação, pule este passo.

2. Verificar o estado e identificar o commit alvo
   - Verifique o histórico e copie o SHA do commit que foi testado/mergeado:
     git --no-pager log --oneline -n 10
   - Confirme que o commit alvo é o que será taggeado (por exemplo, o último commit da branch main).

3. Atualizar arquivos de versão (se aplicável)
   - Atualize package.json, .csproj ou outros arquivos que contenham a versão e commit:
     - Ex.: editar package.json e aumentar a versão para 1.2.3
   - Commitar apenas as mudanças de versão com uma mensagem clara:
     git add package.json && git commit -m "chore(release): bump version to v1.2.3"

4. Criar a tag localmente no commit alvo
   - Recomenda-se usar tags anotadas para preservar metadata:
     git tag -a v1.2.3 -m "Release v1.2.3"
   - Se for necessário assinar a tag (recomendado para releases públicos):
     git tag -s v1.2.3 -m "Release v1.2.3"  # requer GPG configurado
   - Para taggear um commit específico diferente do HEAD:
     git tag -a v1.2.3 <COMMIT_SHA> -m "Release v1.2.3"

5. Validar a tag local
   - Listar tags e confirmar: git tag -n
   - Mostrar a informação da tag recém-criada: git show v1.2.3
   - Verificar assinatura (se aplicada): git tag -v v1.2.3

6. Enviar a tag para o repositório remoto
   - Enviar tag específica:
     git push origin v1.2.3
   - Ou enviar todas as tags locais (use com cautela):
     git push --tags

7. Criar release no GitHub (manual)
   - No GitHub, vá em "Releases" -> "Draft a new release" -> escolha a tag v1.2.3
   - Cole as notas de release (use o template neste documento) e publique.

8. Atualizar CHANGELOG.md / RELEASES.md
   - Adicione um bloco para v1.2.3 com as principais mudanças e notas de migração.

9. Pós-release
   - Marcar issues/tarefas relacionadas como fechadas.
   - Notificar a equipe sobre a nova versão (Slack, e-mail, etc.).

Dicas rápidas:
- Se precisar alterar a tag local antes de enviar (não recomendado), delete-a e crie novamente:
  git tag -d v1.2.3 && git tag -a v1.2.3 -m "Release v1.2.3"
- Se a tag já foi enviada ao remoto, evite deletá-la; prefira publicar uma nova versão (v1.2.4) para corrigir.
- Use mensagens de commit claras e consistentes para facilitar a rastreabilidade.

4. Comandos úteis
- Listar tags: git tag -n
- Mostrar tag/commit: git show v1.2.3
- Verificar assinatura de tag: git tag -v v1.2.3
- Apagar tag local: git tag -d v1.2.3
- Apagar tag remota: git push origin :refs/tags/v1.2.3
- Enviar todas as tags: git push --tags

5. Boas práticas
- Sempre preferir tags anotadas (-a) para preservar mensagem, metadata e data da criação.
- Assinar tags (-s) para maior segurança e confiança, especialmente em releases públicos.
- Nunca reescrever uma tag que já foi publicada; em caso de erro, publique uma nova versão corrigida (ex.: v1.2.3 -> v1.2.4).
- Tagueie o commit exato que foi testado/deployado (não tagueie commits intermediários aleatórios).
- Mantenha um CHANGELOG.md ou RELEASES.md para registrar manualmente as mudanças por versão.
- Utilize Conventional Commits se quiser facilitar a geração automática de changelogs no futuro (opcional).

6. Modelo de notas de release (template)
Título: Release v1.2.3
Data: 2026-01-23

Resumo
- Breve descrição do que mudou e por que é importante.

Principais mudanças
- feat: descrição curta da funcionalidade A
- fix: descrição curta da correção B

Notas de migração (se aplicável)
- Instruções para usuários que precisam adaptar algo ao atualizar

Como reproduzir/testar
- Comandos ou passos para validar a release localmente

Autores
- Lista de autores/committers relevantes

7. Exemplos rápidos
- Criar tag anotada: git tag -a v1.2.3 -m "Release v1.2.3"
- Criar tag assinada: git tag -s v1.2.3 -m "Release v1.2.3"
- Push da tag: git push origin v1.2.3
- Deletar tag remota (se necessário): git push origin :refs/tags/v1.2.3

8. Notas finais
- Esta é uma estratégia manual; quando desejar automatizar (changelogs, releases e deploys) é possível evoluir para ferramentas como semantic-release, release-drafter, ou GitHub Actions.
- Documente qualquer exceção ou processo específico da sua equipe aqui para referência futura.

----
Arquivo gerado automaticamente: docs/TAGGING.md
