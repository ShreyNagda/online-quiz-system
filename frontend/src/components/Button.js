function Button({ text, onClickCallback, className }) {
  return (
    <button
      onClick={() => {
        if (onClickCallback) {
          return onClickCallback();
        } else {
          return console.log("No click callback");
        }
      }}
      className={`${className} bg-white text-black py-1 px-2 rounded active:bg-gray-100 cursor-pointer`}
    >
      {text}
    </button>
  );
}

export default Button;
