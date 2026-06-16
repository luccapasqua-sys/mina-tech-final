const repo = require('../repository');

/** POST /api/inscricao
 * cria uma nova inscrição pública
 * 
 * Contexto:
 * não exige autenticação de administrador; 
 * os dados brutos não vêm diretamente do req.body eles passam antes por um middleware
 * de validação que injeta o objeto limpo em req.validatedInscricao ;
 * em caso de sucesso, retorna o ID gerado no banco de dados para o cliente; */
async function create(req, res, next) {
  try {
    // insere no banco os dados que já foram previamente validados
    const row = await repo.createInscricao(req.validatedInscricao);
    res
      .status(201)
      .json({ message: 'Inscrição realizada com sucesso!', id: row.id });
  } catch (err) {
    // encaminha erros de banco ou conexões para o tratador de erros global
    next(err);
  }
}

module.exports = { create };
