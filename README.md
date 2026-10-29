# zigart.com

Site pessoal de Rafael Zigart. HTML e CSS estáticos, sem build: abra `index.html` no navegador.

## Páginas

- `index.html`: início, com trajetória, o que faço, formação e contato
- `contato.html`: formulário e contatos
- `blog/index.html`: lista de textos
- `midia.html`: vídeos do YouTube e participações em podcasts

## Como adicionar conteúdo

- **Post do blog:** copie `blog/ia-na-construcao-de-produtos-financeiros.html` com um novo nome, troque título, data e texto, e adicione um item no topo da lista em `blog/index.html`.
- **Vídeo:** em `midia.html`, copie o modelo comentado dentro de `data-list="videos"` e troque `VIDEO_ID` pelo código do link do YouTube. Depois apague o parágrafo `media-empty` da seção.
- **Episódio de podcast:** mesmo processo em `data-list="podcasts"`.
- **Email e LinkedIn:** troque os trechos `<span class="fill" ...>` em `index.html` e `contato.html`.
- **Formulário:** preencha `data-endpoint` em `contato.html` com a URL de um serviço de formulários (por exemplo, Formspree). Sem isso, o formulário avisa que nada foi enviado.

## Design

Tema Studio do Hallmark. Cores e fontes ficam em `css/tokens.css`; o estilo das páginas em `css/site.css`.
