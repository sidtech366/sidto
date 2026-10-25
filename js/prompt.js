/* Sidto — reusable AI image prompt builder.
 * This only creates TEXT. It does not create an image.
 */
(function () {
  const STYLES = {
    traditional: "in the style of a traditional Indian devotional painting, rich mineral pigments, ornate gold borders, fine brushwork",
    watercolor: "as a soft watercolour illustration, gentle washes of colour, delicate textures, airy and luminous",
    "3d": "as a high-quality 3D devotional render, cinematic lighting, soft volumetric glow, detailed materials",
    minimal: "as a clean minimal flat vector illustration, bold simple shapes, limited harmonious palette",
    rangoli: "inspired by rangoli and Indian folk art, symmetrical patterns, vibrant powder colours, decorative motifs",
    photo: "as a photorealistic scene, natural light, shallow depth of field, high detail"
  };
  const ASPECTS = { square: "1:1 square", portrait: "4:5 portrait", story: "9:16 vertical" };

  function build(o) {
    const parts = [];
    const occasion = o.occasion || "an Indian Hindu festival";
    parts.push(`A respectful, devotional festive greeting image for ${occasion}`);
    if (o.subject) parts.push(`honouring ${o.subject}, shown respectfully and with traditional iconography`);
    if (o.basePrompt) parts.push(o.basePrompt);
    parts.push(STYLES[o.style] || STYLES.traditional);
    parts.push("warm, auspicious colour palette with saffron, gold, deep red and soft light");
    if (o.custom) parts.push(o.custom.trim());
    parts.push(`composition: ${ASPECTS[o.aspect] || ASPECTS.portrait}`);
    if (o.leaveSpace) parts.push("leave clean empty space at the top for a greeting title and at the bottom for a name and small portrait");
    parts.push("no text, no letters, no watermark, no logos");
    parts.push("culturally accurate, dignified, not cartoonish or disrespectful, no distorted hands or faces");
    const prompt = parts.join(", ") + ".";
    const negative = "text, words, watermark, logo, signature, low quality, blurry, distorted anatomy, extra limbs, disrespectful depiction, gore";
    return { prompt, negative };
  }

  window.SidtoPrompt = { build, STYLES: Object.keys(STYLES), ASPECTS };
})();
