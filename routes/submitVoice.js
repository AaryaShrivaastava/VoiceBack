const { getConnection } = require('../db/config');

async function insertSubmission(data) {
  const connection = await getConnection();

  const query = `
    INSERT INTO voice_submissions (title, description, media_url, is_anonymous, region, sdg_tag)
    VALUES (:title, :description, :media_url, :is_anonymous, :region, :sdg_tag)
  `;

  const binds = {
    title: data.title,
    description: data.description,
    media_url: data.media_url,
    is_anonymous: data.is_anonymous,
    region: data.region,
    sdg_tag: data.sdg_tag
  };

  await connection.execute(query, binds, { autoCommit: true });
  await connection.close();
}

module.exports = { insertSubmission };
