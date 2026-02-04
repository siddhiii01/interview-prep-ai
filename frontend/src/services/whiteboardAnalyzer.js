export function parseDrawing(elements) {
    console.log("Element: received: ", elements)
  // classify elements by type
  const components = []
  const labels = []
  const connections = []

  elements.forEach(el => {
    if(el.type === "rectangle") components.push(el);
    else if (el.type === "text") labels.push(el);
    else if (el.type === "arrow") connections.push(el);
  });

  const componentsNodes = groupLabelsWithComponents(components, labels)

  return { components:componentsNodes, labels, connections };
}

function groupLabelsWithComponents(components, labels) {
  const result = [];

  components.forEach(rect => {
    let matchedLabel = null;

    labels.forEach(label => {
      const labelX = label.x;
      const labelY = label.y;

      const rectLeft = rect.x;
      const rectRight = rect.x + rect.width;
      const rectTop = rect.y;
      const rectBottom = rect.y + rect.height;

      // check if label lies inside rectangle area
      if (labelX >= rectLeft && labelX <= rectRight &&
          labelY >= rectTop  && labelY <= rectBottom) {

        matchedLabel = label.text; // assign label text
      }
    });

    result.push({
      id: rect.id,
      label: matchedLabel || "UNLABELED",
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    });
  });

  return result;
}
