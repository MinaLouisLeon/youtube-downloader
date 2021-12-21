import { Button } from "antd";
import "./Mmodal.css";

const Mmodal = ({ setShow, show, onClose, submitText, onSubmit, children }) => {
  const MmodalShow = show ? "Mmodal-block" : "Mmodal-none";
  return (
    <div className={"Mmodal-main-container " + MmodalShow}>
      <div className="Mmodal-inner-container br4">
        <div className="pa2 ma2">
          <section>{children}</section>
          <section className="tr">
            {submitText && (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  onSubmit();
                }}
              >
                {submitText}
              </Button>
            )}
            <Button
              type="danger"
              size="small"
              onClick={() => {
                setShow(false);
                onClose();
              }}
            >
              Cancel
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Mmodal;
