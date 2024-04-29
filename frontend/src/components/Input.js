function Input({ placeholder, value, callback, onFocusCallback, className }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(ev) => callback(ev)}
      onFocus={() => onFocusCallback()}
      className={`${className} py-1 px-2 bg-white text-black rounded w-full`}
    ></input>
  );
}

export default Input;
