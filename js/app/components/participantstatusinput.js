define([
  'react',
  'create-react-class',
  'pure-render-mixin',
  'prop-types'
],

function (React, createReactClass, PureRenderMixin, PropTypes) {
  'use strict';

  var el = React.createElement;

  return createReactClass({
    mixins: [PureRenderMixin],

    displayName: 'ParticipationStatusInput',

    propTypes: {
      status: PropTypes.number.isRequired,
      amount: PropTypes.number,
      handleJoinedChange: PropTypes.func.isRequired,
      handlePaidChange: PropTypes.func.isRequired,
    },

    getAmount: function () {
      return parseFloat(this.refs.amount.value || 0);
    },

    focusAmount: function () {
      this.refs.amount.focus();
    },

    render: function () {
      return (
        el('span', {className: 'participationStatus'},
          el('span', {className: 'joinedButtonWrapper' + (this.props.status === 2 ? ' hidden' : '')},
            el('button', {
              type: 'button',
              className: this.props.status > 0 ? ' selected' : '',
              ref: 'joined',
              onClick: this.props.handleJoinedChange
            }, 'joined')
          ),
          el('button', {
            type: 'button',
            className: 'paid-button' + (this.props.status === 2 ? ' selected' : ''),
            ref: 'paid',
            onClick: this.props.handlePaidChange
          }, 'paid'),
          el('span', {className: 'amountInput' + (this.props.status < 2 ? ' hidden' : '')},
            el('input', {
              type: 'number',
              step: 'any',
              disabled: this.props.status !== 2 ? 'disabled' : '',
              placeholder: 0,
              defaultValue: this.props.amount,
              ref: 'amount'
            })
          )
        )
      );
    }

  });

});
