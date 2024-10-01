interface MockButtonProps {
  label?: string;
  onClick?: () => void;
}

const MockButton = ({ label = "Click Me", onClick }: MockButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        backgroundColor: "lightgray",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
};

export default MockButton;
