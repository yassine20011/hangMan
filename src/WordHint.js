const WordHint = ({ definition, showHint, setShowHint }) => {
  return (
    <div className='hintBox'>
      {!showHint ? (
        <button onClick={() => setShowHint(true)}>Show Hint</button>
      ) : (
        <p>
          <span className='bold'>Hint:</span> {definition}
        </p>
      )}
    </div>
  );
};

export default WordHint;
