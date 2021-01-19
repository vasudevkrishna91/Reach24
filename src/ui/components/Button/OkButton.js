import React, {Component} from 'react';
import { Fab } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import { withStyles } from '@material-ui/core/styles';

import PropTypes from 'prop-types';


const styles = () => ({
    button: {
        position: 'absolute',
        width: 50,
        height: 50,
        top: -6,
        right: -38,
    }
});


// const classes = {
//     position: absolute,
//     width: 50,
//     height: 50,
//     top: -6,
//     right: -38,
// }


class OkButton extends Component {
    
    constructor(props) {
        super(props);
        // this.classes = useStyles();
        this.state = {

        }
    }



    render() {
        const { handleOnSubmit, classes, disabled } = this.props;
        return (
            // <div class="proceed_btn">
            //     <input type='button' onClick={handleOnSubmit} />
            // </div>
          <Fab 
            size="small" 
            color="primary"
            aria-label="add"
            className={classes.button}
            onClick={handleOnSubmit}
            disabled={disabled}
          >
            <DoneIcon />
          </Fab>
        )
    }
}

OkButton.propTypes = {
  classes: PropTypes.instanceOf(Object).isRequired,
  disabled: PropTypes.bool.isRequired,
  handleOnSubmit: PropTypes.func.isRequired,
}

export default withStyles(styles)(OkButton);
