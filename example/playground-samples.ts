export const defaultPlaygroundCode = `const count = signal(0);

render("#render-app", (frag) => {
  const button = frag.createElement("button", { key: "counter" });
  const handler = () => count.set(count() + 1);

  button.addEventListener("click", handler);
  frag.onCleanup(() => button.removeEventListener("click", handler));

  button.textContent = \`Count: \${count()}\`;
  return button;
});`;

export const searchPlaygroundCode = `const rawInput = signal("pikachu");

const query = rawInput.to(debounceTime(400));

const { data, loading, error } = fromHttp(
  () => \`https://pokeapi.co/api/v2/pokemon/\${query()?.trim().toLowerCase()}\`,
);

render("#render-app", (frag) => {
  const input = frag.createElement("input", { key: "input" });
  input.placeholder = "Pokémon name…";
  input.value = rawInput();

  const onInput = () => rawInput.set(input.value);
  input.addEventListener("input", onInput);
  frag.onCleanup(() => input.removeEventListener("input", onInput));

  const name = query()?.trim();
  let text = "Enter a Pokémon name…";

  if (name) {
    if (loading()) text = "Loading…";
    else if (error()) text = error().message;
    else if (data()) text = data().name;
  }

  return frag.createElement("div", {
    key: "root",
    children: [
      input,
      frag.createElement("p", { key: "output", text }),
    ],
  });
});`;
