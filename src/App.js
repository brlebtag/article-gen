import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import update from 'immutability-helper';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import DatePicker from 'react-date-picker';
import './App.css';
import {
  traduzir, fixLinha, quebrarChaves,
  quebrarAutores, cloneArr, nome,
  quebrarLinha, ajustarAcentuacao
} from './helpers';
import moment from 'moment';
import Highlight from 'react-highlight.js';

function copyToClipboard(str) {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};

function atualizar(self, state) {
  self.setState(update(self.state, state));
}

const PT_BR = 1;
const EN_US = 2;
const LANG_DEFAULT = PT_BR;
const PT_BR_CODE = 'pt';
const EN_US_CODE = 'en';
const ARTIGO_COMPLETO = 'ART';
const ARTIGO_CURTO = 'SHORT';
const PADRAO_ARTIGO = ARTIGO_COMPLETO;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lingua: LANG_DEFAULT,
      title: '',
      titulo: '',
      abstract: '',
      resumo: '',
      keywords: '',
      palavrasChaves: '',
      dataPub: null,
      pagInicio: 1,
      pagFim: 1,
      authors: '',
      autores: '',
      xml: '',
      tipo: PADRAO_ARTIGO,
      seq: 1,
    };
  }

  componentDidMount() {
    try {
      let state = JSON.parse(localStorage['article-gen']);

      let data = moment(state.dataPub);

      if (data.isValid()) {
        state.dataPub = moment(state.dataPub).toDate();
      } else {
        state.dataPub = null;
      }
      
      this.setState(state);
    } catch(e) { 
      console.log(e);
    }

    setInterval(() => {
      this.backup();
    }, 5000)
  }

  backup() {
    localStorage['article-gen'] = JSON.stringify(this.state);
  }

  componentWillUnmount() {
    this.backup();
  }

  setLingua(estado) {
    this.setState(update(this.state, {
      lingua: {$set: estado},
    }));
  }

  setTargetValue(key, e) {
    this.setState(update(this.state, {
      [key]: {$set: e.target.value},
    }));
  }

  setValue(key, value) {
    this.setState(update(this.state, {
      [key]: {$set: value},
    }));
  }

  processaTitulo(lingua = LANG_DEFAULT) {
    let { title = '', titulo = '' } = this.state;

    switch(lingua) {
      case PT_BR: {
        titulo = fixLinha(titulo);

        traduzir([{
          text: titulo,
          to: EN_US_CODE,
          from: PT_BR_CODE
        }]).then(([data]) => {
          atualizar(this, {
            titulo: {$set: titulo},
            title: {$set: data.text}
          });
        });
      }
      break;
      case EN_US: {
        title = fixLinha(title);

        traduzir([{
          text: title,
          to: PT_BR_CODE,
          from: EN_US_CODE,
        }]).then(([data]) => {
          atualizar(this, {
            title: {$set: title},
            titulo: {$set: data.text}
          });
        });
      }
      break;
    }
  }

  processaPalavrasChaves(lingua = LANG_DEFAULT) {
    let { keywords = '', palavrasChaves = '' } = this.state;

    switch(lingua) {
      case PT_BR: {
        palavrasChaves = fixLinha(palavrasChaves);

        const chaves = quebrarChaves(palavrasChaves);

        const request =
          chaves
          .map(chave => ({
            text: chave,
            to: EN_US_CODE,
            from: PT_BR_CODE,
          }));

        traduzir(request).then(res => {
          atualizar(this, {
            palavrasChaves: {$set: chaves.join("\n")},
            keywords: {$set: res.map(r => r.text).join("\n")}
          });
        });
      }
      break;
      case EN_US: {
        keywords = fixLinha(keywords);

        const chaves = quebrarChaves(keywords);

        const request =
          chaves
          .map(chave => ({
            text: chave,
            to: PT_BR_CODE,
            from: EN_US_CODE,
          }));

        traduzir(request).then(res => {
          atualizar(this, {
            keywords: {$set: chaves.join("\n")},
            palavrasChaves: {$set: res.map(r => r.text).join("\n")}
          });
        });
      }
      break;
    }
  }

  processaAutores(lingua = LANG_DEFAULT) {
    let { authors = '', autores = '' } = this.state;

    switch(lingua) {
      case PT_BR: {
        autores = quebrarAutores(autores);
        
        if (autores.length == 0 || autores.some(a => a == '')) return;

        authors = cloneArr(autores.map(a => cloneArr(a)));

        let unis = authors.map(autor => autor[1] || '');

        let request =
          unis
          .map(uni => ({
            text: uni,
            to: EN_US_CODE,
            from: PT_BR_CODE,
          }));

        traduzir(request).then(res => {
          res.map((r,i) => {
            authors[i][1] = r.text;
          });

          atualizar(this, {
            autores: {$set: autores.map(a => a.join("\n")).join("\n\n") || ''},
            authors: {$set: authors.map(a => a.join("\n")).join("\n\n") || ''}
          });
        });
      }
      break;
      case EN_US: {
        authors = quebrarAutores(authors);

        if (authors.length == 0 || authors.some(a => a == '')) return;

        autores = cloneArr(authors.map(a => cloneArr(a)));

        let unis = authors.map(autor => autor[1] || '');

        let request =
          unis
          .map(uni => ({
            text: uni,
            to: PT_BR_CODE,
            from: EN_US_CODE,
          }));

        traduzir(request).then(res => {
          res.map((r,i) => {
            autores[i][1] = r.text;
          });

          atualizar(this, {
            autores: {$set: autores.map(a => a.join("\n")).join("\n\n") || ''},
            authors: {$set: authors.map(a => a.join("\n")).join("\n\n") || ''}
          });
        });
      }
      break;
    }
  }

  processaResumo(lingua = LANG_DEFAULT) {
    let { resumo = '', abstract = '' } = this.state;

    switch(lingua) {
      case PT_BR: {
        resumo = fixLinha(resumo);

        traduzir([{
          text: resumo,
          to: EN_US_CODE,
          from: PT_BR_CODE
        }]).then(([data]) => {
          atualizar(this, {
            resumo: {$set: resumo},
            abstract: {$set: data.text}
          });
        });
      }
      break;
      case EN_US: {
        abstract = fixLinha(abstract);

        traduzir([{
          text: abstract,
          to: PT_BR_CODE,
          from: EN_US_CODE,
        }]).then(([data]) => {
          atualizar(this, {
            abstract: {$set: abstract},
            resumo: {$set: data.text}
          });
        });
      }
      break;
    }
  }

  gerarXML() {
    let {
      lingua = LANG_DEFAULT,
      title = '',
      titulo = '',
      abstract = '',
      resumo = '',
      keywords = '',
      palavrasChaves = '',
      dataPub = null,
      pagInicio = 1,
      pagFim = 1,
      authors = '',
      autores = '',
      xml = '',
      tipo = PADRAO_ARTIGO,
      seq = 1,
    } = this.state;

    
    authors = quebrarAutores(authors);
    autores = quebrarAutores(autores);

    const idioma = [
      '',
      'pt_BR',
      'en_US',
    ];

    xml = `    <article locale="${idioma[lingua]}" date_submitted="${moment(dataPub).format('YYYY-MM-DD')}" stage="production" date_published="${moment(dataPub).format('YYYY-MM-DD')}" section_ref="${tipo}" seq="${seq}" access_status="0">\n`;
    xml += `      <title locale="${idioma[PT_BR]}">${titulo}</title>\n`;
    xml += `      <title locale="${idioma[EN_US]}">${title}</title>\n`;
    xml += `      <abstract locale="${idioma[PT_BR]}">${resumo}</abstract>\n`;
    xml += `      <abstract locale="${idioma[EN_US]}">${abstract}</abstract>\n`;

    keywords = quebrarLinha(keywords);

    if (keywords.length > 0) {
      xml += `      <keywords locale="${idioma[EN_US]}">\n`;
      xml += keywords.map(key => {
        return `          <keyword>${key}</keyword>`;
      }).join("\n");
      xml += `\n      </keywords>\n`;
    }

    palavrasChaves = quebrarLinha(palavrasChaves);

    if (palavrasChaves.length > 0) {
      xml += `      <keywords locale="${idioma[PT_BR]}">\n`;
      xml += palavrasChaves.map(key => {
        return `          <keyword>${key}</keyword>`;
      }).join("\n");
      xml += `\n      </keywords>\n`;
    }  

    xml += autores.map((autor, i) => {
      try {
        let n = nome(autor[0]);
        return `      <author primary_contact="true" include_in_browse="true" user_group_ref="Author">
        <firstname>${n.firstName}</firstname>
        <lastname>${n.lastName}</lastname>
        <affiliation locale="pt_BR">${autor[1]}</affiliation>
        <affiliation locale="en_US">${authors[i][1]}</affiliation>
        <email>${autor[2] || 'nomail@mail.com'}</email>
      </author>`;
      } catch(e) {
        return '';
      }
    }).join("\n");  

    xml += `\n      <article_galley approved="false" xsi:schemaLocation="http://pkp.sfu.ca native.xsd">
        <id type="internal" advice="ignore">4071</id>
        <name locale="pt_BR">PDF</name>
        <seq>0</seq>
        <remote src="https://doi.org/10.1145/3229345.3229346" />
      </article_galley>
      <pages>${pagInicio} - ${pagFim}</pages>
    </article>`;

    atualizar(this, {
      xml: {$set: xml},
    });
  }

  novo() {
    let seq = parseInt(this.state.seq);
    let fim = parseInt(this.state.pagFim);

    if (window.confirm('XML já foi copiado?')) {
      this.setState({
        lingua: this.state.lingua,
        title: '',
        titulo: '',
        abstract: '',
        resumo: '',
        keywords: '',
        palavrasChaves: '',
        dataPub: this.state.dataPub,
        pagInicio: fim == NaN ? fim : fim + 1,
        pagFim: fim == NaN ? fim : fim + 1,
        authors: '',
        autores: '',
        xml: '',
        tipo: this.state.tipo,
        seq: seq == NaN ?
          seq : seq + 1,
      });
    }
  }

  copiar(from, to) {
    atualizar(this, {
      [to]: {$set: this.state[from]},
    });
  }

  formatar(target) {
    atualizar(this, {
      [target]: {$set: fixLinha(this.state[target])},
    });
  }

  formatarLinhas(target) {
    let value = this.state[target];

    value = value
      .split("\n")
      .map(v => v.trim())
      .join("\n");

    atualizar(this, {
      [target]: {$set: value},
    });
  }

  acentos(target) {
    let value = ajustarAcentuacao(this.state[target]);

    atualizar(this, {
      [target]: {$set: value},
    });
  }

  render() {
    const {
      lingua = LANG_DEFAULT,
      title = '',
      titulo = '',
      abstract = '',
      resumo = '',
      keywords = '',
      palavrasChaves = '',
      dataPub = null,
      pagInicio = 1,
      pagFim = 1,
      authors = '',
      autores = '',
      xml = '',
      tipo = PADRAO_ARTIGO,
      seq = 1,
    } = this.state;

    return (
      <div className="App">
        <Container>
          <Row>
            <Col className="mb-4 clearfix">
              <div className="float-left">
                <Button variant="success" onClick={this.gerarXML.bind(this)}>Gerar</Button>
              </div>
              <div className="float-right">
                <Button variant="danger" onClick={this.novo.bind(this)}>Novo</Button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <Tabs defaultActiveKey="artigo" id="uncontrolled-tab-example">
                <Tab eventKey="artigo" title="Artigo">
                  <Form className="mt-3">
                    <h2 className="display-4">Publica&ccedil;&atilde;o</h2>
                    <Row>
                      <Col>
                        <Form.Group controlId="formPublicacao">
                          <Form.Label>Tipo de artigo:</Form.Label>
                          <Form.Control as="select" value={tipo} onChange={this.setTargetValue.bind(this, 'tipo')}>
                            <option value={ARTIGO_COMPLETO}>Completo</option>
                            <option value={ARTIGO_CURTO}>Curto</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group controlId="formPublicacao">
                          <Form.Label>Nº da sequencia:</Form.Label>
                          <Form.Control type="number"
                            value={seq}
                            onChange={this.setTargetValue.bind(this, 'seq')}/>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group controlId="formPublicacao">
                          <Form.Label>Data Publica&ccedil;&atilde;o:</Form.Label>
                          <DatePicker
                            value={dataPub}
                            onChange={this.setValue.bind(this, 'dataPub')}/>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group controlId="formPaginaInicio">
                          <Form.Label>P&aacute;gina Inicio:</Form.Label>
                          <Form.Control type="number"
                            value={pagInicio}
                            onChange={this.setTargetValue.bind(this, 'pagInicio')}/>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group controlId="formPaginaFim">
                          <Form.Label>Página Fim:</Form.Label>
                          <Form.Control type="number"
                            value={pagFim}
                            onChange={this.setTargetValue.bind(this, 'pagFim')} />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group controlId="formLingua">
                      <Form.Label>Língua do artigo:</Form.Label>
                      <Row>
                        <Col>
                          <Form.Check
                            type="radio"
                            label="Português"
                            id="portugues_check"
                            value="1"
                            checked={lingua === 1}
                            onChange={this.setLingua.bind(this, 1)}
                          />
                        </Col>
                        <Col>
                          <Form.Check
                            type="radio"
                            label="Inglês"
                            value="2"
                            id="ingles_check"
                            checked={lingua === 2}
                            onChange={this.setLingua.bind(this, 2)}
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                    <h2 className="display-4">Artigo
                      <Button type="button" title="Copiar de 'Titulo' para 'Title'" variant="light" onClick={this.copiar.bind(this, 'titulo', 'title')}>
                      <i class="fas fa-arrow-down"></i>
                      </Button>
                      <Button type="button" title="Copiar de 'Title' para 'Titulo'" variant="light" onClick={this.copiar.bind(this, 'title', 'titulo')}>
                      <i class="fas fa-arrow-up"></i>
                      </Button>
                    </h2>
                    <Form.Group controlId="formTitulo">
                      <Form.Label>Titulo: <Button title="Traduzir para Inglês" type="button" variant="light" onClick={this.processaTitulo.bind(this, PT_BR)}>
                          <i className="fas fa-language"></i>
                        </Button>
                        <Button type="button" variant="light" title="Formatar" onClick={this.formatar.bind(this, 'titulo')}>
                          <i class="fas fa-font"></i>
                        </Button></Form.Label>
                      <Form.Control as="textarea" rows="2"
                        value={titulo}
                        onChange={this.setTargetValue.bind(this, 'titulo')} />
                        <Form.Text className="text-muted">
                          Se o idoma selecionado for Português colocar texto em aqui.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formTitle">
                      <Form.Label>Title: <Button title="Traduzir para Português" type="button" variant="light" onClick={this.processaTitulo.bind(this, EN_US)}>
                          <i className="fas fa-language"></i>
                        </Button>
                        <Button type="button" variant="light" title="Formatar" onClick={this.formatar.bind(this, 'title')}>
                          <i class="fas fa-font"></i>
                        </Button></Form.Label>
                      <Form.Control as="textarea" rows="2"
                        value={title}
                        onChange={this.setTargetValue.bind(this, 'title')} />
                        <Form.Text className="text-muted">
                          Se o idoma selecionado for Inglês colocar texto em aqui.
                        </Form.Text>
                    </Form.Group>
                  </Form>
                </Tab>
                <Tab eventKey="palavrasChaves" title="Palavras Chaves">
                  <Form className="mb-4">
                  <h2 className="display-4">Chaves <Button type="button" title="Copiar de 'Palavras-chaves' para 'Keywords'" variant="light" onClick={this.copiar.bind(this, 'palavrasChaves', 'keywords')}>
                      <i class="fas fa-arrow-down"></i>
                    </Button>
                    <Button type="button" title="Copiar de 'Keywords' para 'Palavras-chaves'" variant="light" onClick={this.copiar.bind(this, 'keywords', 'palavrasChaves')}>
                      <i class="fas fa-arrow-up"></i>
                    </Button>
                  </h2>
                    <Form.Group controlId="formpalavrasChaves">
                        <Form.Label>Palavras-chaves: <Button title="Traduzir para Inglês" type="button" variant="light" onClick={this.processaPalavrasChaves.bind(this, PT_BR)}>
                            <i className="fas fa-language"></i>
                          </Button>
                        </Form.Label>
                        <Form.Control as="textarea" rows="6"
                          value={palavrasChaves}
                          onChange={this.setTargetValue.bind(this, 'palavrasChaves')} />
                          <Form.Text className="text-muted">
                            Se o idoma selecionado for Português colocar texto em aqui.
                          </Form.Text>
                      </Form.Group>
                      <Form.Group controlId="formkeywords">
                        <Form.Label>Keywords: <Button title="Traduzir para Português" type="button" variant="light" onClick={this.processaPalavrasChaves.bind(this, EN_US)}>
                            <i className="fas fa-language"></i>
                          </Button>
                        </Form.Label>
                        <Form.Control as="textarea" rows="6"
                          value={keywords}
                          onChange={this.setTargetValue.bind(this, 'keywords')} />
                          <Form.Text className="text-muted">
                            Se o idoma selecionado for Inglês colocar texto em aqui.
                          </Form.Text>
                      </Form.Group>
                  </Form>
                </Tab>
                <Tab eventKey="autores" title="Autores">
                  <Form className="mt-4">
                  <h2 className="display-4">Autores
                    <Button type="button" title="Copiar de 'Autores' para 'Authors'" variant="light" onClick={this.copiar.bind(this, 'autores', 'authors')}>
                      <i class="fas fa-arrow-down"></i>
                    </Button>
                    <Button type="button" title="Copiar de 'Authors' para 'Autores'" variant="light" onClick={this.copiar.bind(this, 'authors', 'autores')}>
                      <i class="fas fa-arrow-up"></i>
                    </Button>
                  </h2>
                    <Form.Group controlId="formAutores">
                      <Form.Label>Autores: <Button type="button" title="Traduzir para Inglês" variant="light" onClick={this.processaAutores.bind(this, PT_BR)}>
                          <i className="fas fa-language"></i>
                        </Button>
                      </Form.Label>
                      <Form.Control as="textarea" rows="8" value={autores}
                        onChange={this.setTargetValue.bind(this, 'autores')} />
                      <Form.Text className="text-muted">
                      Se o idoma selecionado for Inglês colocar texto em aqui.<br/>
                        Os autores devem ser separados por uma quebra de linha. Devem estar na seguinte ordem: Nome, universidade, e-mail com cada um por uma linha.<br/>
                        ex: <br/> Fulando dos Santos<br/>
                        Faculdade X<br/>
                        fulano@email.com<br/>
                      </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formAuthors">
                      <Form.Label>Authors: <Button type="button" title="Traduzir para Português" variant="light" onClick={this.processaAutores.bind(this, EN_US)}>
                          <i className="fas fa-language"></i>
                        </Button>
                      </Form.Label>
                      <Form.Control as="textarea" rows="8" value={authors}
                        onChange={this.setTargetValue.bind(this, 'authors')} />
                      <Form.Text className="text-muted">
                        Se o idoma selecionado for Inglês colocar texto em aqui.<br/>
                      </Form.Text>
                    </Form.Group>
                  </Form>
                </Tab>
                <Tab eventKey="resumo" title="Resumo">
                  <Form className="mt-4">
                  <h2 className="display-4">Resumo
                    <Button type="button" title="Copiar de 'Resumo' para 'Abstract'" variant="light" onClick={this.copiar.bind(this, 'resumo', 'abstract')}>
                      <i class="fas fa-arrow-down"></i>
                    </Button>
                    <Button type="button" title="Copiar de 'Abstract' para 'Resumo'" variant="light" onClick={this.copiar.bind(this, 'abstract', 'resumo')}>
                      <i class="fas fa-arrow-up"></i>
                    </Button>
                  </h2>
                    <Form.Group controlId="formResumo">
                      <Form.Label>Resumo: <Button type="button" title="Traduzir para Inglês" variant="light" onClick={this.processaResumo.bind(this, PT_BR)}>
                          <i className="fas fa-language"></i>
                        </Button>
                        <Button type="button" variant="light" title="Formatar" onClick={this.formatar.bind(this, 'resumo')}>
                          <i class="fas fa-font"></i>
                        </Button><Button type="button" variant="light" title="Ajustar Acentuação" onClick={this.acentos.bind(this, 'resumo')}>
                          <i class="fas fa-pen-fancy"></i>
                        </Button>
                      </Form.Label> 
                      <Form.Control as="textarea" rows="6" value={resumo}
                        onChange={this.setTargetValue.bind(this, 'resumo')} />
                        <Form.Text className="text-muted">
                          Se o idoma selecionado for Português colocar texto em aqui.<br/>
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="formAbstract">
                      <Form.Label>Abstract: <Button type="button" title="Traduzir para Português" variant="light" onClick={this.processaResumo.bind(this, EN_US)}>
                          <i className="fas fa-language"></i>
                        </Button>
                        <Button type="button" variant="light" title="Formatar" onClick={this.formatar.bind(this, 'abstract')}>
                          <i class="fas fa-font"></i>
                        </Button><Button type="button" variant="light" title="Ajustar Acentuação" onClick={this.acentos.bind(this, 'abstract')}>
                        <i class="fas fa-pen-fancy"></i>
                        </Button>
                      </Form.Label>
                      <Form.Control as="textarea" rows="6" value={abstract}
                        onChange={this.setTargetValue.bind(this, 'abstract')} />
                        <Form.Text className="text-muted">
                          Se o idoma selecionado for Inglês colocar texto em aqui.<br/>
                        </Form.Text>
                    </Form.Group>
                  </Form>
                </Tab>
              </Tabs>
            </Col>
          </Row>
          <br />
          <hr />
          <br />
          <Row>
            <Col>
              <h1 className="display-4 clearfix">
                <div className="float-left">
                  Resultado Final
                </div>
                <div className="float-right">
                  <Button type="button" variant="success" onClick={this.gerarXML.bind(this)}>Gerar</Button>
                  <Button type="button" variant="light" onClick={() => copyToClipboard(xml)}><i class="fas fa-copy"></i></Button>
                </div>
              </h1>
              <br />
              <Highlight>
                {xml}
              </Highlight>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
