(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    /**
     * @external L.DomUtil
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/dom/DomUtil.js
     */

    const domUtilProto = L.extend({}, L.DomUtil);

    L.extend(L.DomUtil, {

        /**
         * Resets the 3D CSS transform of `el` so it is
         * translated by `offset` pixels and optionally
         * scaled by `scale`. Does not have an effect if
         * the browser doesn't support 3D CSS transforms.
         * 
         * @param {HTMLElement} el 
         * @param {L.Point} offset 
         * @param {Number} scale
         * @param {Number} bearing 
         * @param {L.Point} pivot 
         */
        setTransform: function(el, offset, scale, bearing, pivot) {
            var pos = offset || new L.Point(0, 0);

            if (!bearing) {
                offset = pos._round();
                return domUtilProto.setTransform.apply(this, arguments);
            }

            pos = pos.rotateFrom(bearing, pivot);

            el.style[L.DomUtil.TRANSFORM] =
                'translate3d(' + pos.x + 'px,' + pos.y + 'px' + ',0)' +
                (scale ? ' scale(' + scale + ')' : '') +
                ' rotate(' + bearing + 'rad)';
        },

        /**
         * Sets the position of `el` to coordinates specified by
         * `position`, using CSS translate or top/left positioning
         * depending on the browser (used by Leaflet internally
         * to position its layers).
         * 
         * @param {HTMLElement} el 
         * @param {L.Point} point 
         * @param {Number} bearing
         * @param {L.Point} pivot 
         * @param {Number} scale 
         */
        setPosition: function(el, point, bearing, pivot, scale) {
            if (!bearing) {
                return domUtilProto.setPosition.apply(this, arguments);
            }

            /*eslint-disable */
            el._leaflet_pos = point;
            /*eslint-enable */

            if (L.Browser.any3d) {
                L.DomUtil.setTransform(el, point, scale, bearing, pivot);
            } else {
                el.style.left = point.x + 'px';
                el.style.top = point.y + 'px';
            }
        },

        /**
         * @constant radians = degrees × π/180°
         */
        DEG_TO_RAD: Math.PI / 180,

        /**
         * @constant degrees = radians × 180°/π
         */
        RAD_TO_DEG: 180 / Math.PI,

    });

    /**
     * @external L.Draggable
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/dom/Draggable.js
     */

    /**
     * A class for making DOM elements draggable (including touch support).
     * Used internally for map and marker dragging. Only works for elements
     * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
     */

    L.Draggable.include({

        /** @TODO */
        // updateMapBearing: function(mapBearing) {
        //     this._mapBearing = mapBearing;
        // },

    });

    /**
     * @external L.Point
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/geometry/Point.js
     */

    L.extend(L.Point.prototype, {

        /**
         * Rotate around (0,0) by applying the 2D rotation matrix:
         * 
         * ⎡ x' ⎤ = ⎡ cos θ  -sin θ ⎤ ⎡ x ⎤
         * ⎣ y' ⎦   ⎣ sin θ   cos θ ⎦ ⎣ y ⎦
         * 
         * @param theta must be given in radians.
         */
        rotate: function(theta) {
            return this.rotateFrom(theta, new L.Point(0,0))
        },

        /**
         * Rotate around (pivot.x, pivot.y) by:
         * 
         * 1. subtract (pivot.x, pivot.y)
         * 2. rotate around (0, 0)
         * 3. add (pivot.x, pivot.y) back
         * 
         * same as `this.subtract(pivot).rotate(theta).add(pivot)`
         * 
         * @param {Number} theta 
         * @param {L.Point} pivot 
         * 
         * @returns {L.Point}
         */
        rotateFrom: function(theta, pivot) {
            if (!theta) { return this; }
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);
            var cx = pivot.x,
                cy = pivot.y;
            var x = this.x - cx,
                y = this.y - cy;

            return new L.Point(
                x * cosTheta - y * sinTheta + cx,
                x * sinTheta + y * cosTheta + cy
            );
        },

    });

    /**
     * @external L.DivOverlay
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/DivOverlay.js
     */

    const divOverlayProto = L.extend({}, L.DivOverlay.prototype);

    L.DivOverlay.include({

        /**
         * Update L.Popup and L.Tooltip anchor positions after
         * the map is moved by calling `map.setBearing(theta)`
         * 
         * @listens L.Map~rotate
         */
        getEvents: function() {
            return L.extend(divOverlayProto.getEvents.apply(this, arguments), { rotate: this._updatePosition });
        },

        /**
         * 0. update element anchor point (divOverlayProto v1.9.3)
         * 1. rotate around anchor point (subtract anchor -> rotate point -> add anchor)
         */
        _updatePosition: function() {
            if (!this._map) { return; }
            divOverlayProto._updatePosition.apply(this, arguments);
            if (this._map && this._map._rotate && this._zoomAnimated) {
                var anchor = this._getAnchor();
                var pos = L.DomUtil.getPosition(this._container).subtract(anchor);
                L.DomUtil.setPosition(this._container, this._map.rotatedPointToMapPanePoint(pos).add(anchor));
            }

        },

    });

    /**
     * @external L.Popup
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/Popup.js
     */

    const popupProto = L.extend({}, L.Popup.prototype);

    L.Popup.include({

        /**
         * 0. update element anchor point (popupProto v1.9.3)
         * 1. rotate around anchor point (subtract anchor -> rotate point -> add anchor)
         */
        _animateZoom: function(e) {
            popupProto._animateZoom.apply(this, arguments);
            if (this._map && this._map._rotate) {
                var anchor = this._getAnchor();
                var pos = L.DomUtil.getPosition(this._container).subtract(anchor);
                L.DomUtil.setPosition(this._container, this._map.rotatedPointToMapPanePoint(pos).add(anchor));
            }
        },

        /**
         * Fix for L.popup({ keepInView = true })
         * 
         * @see https://github.com/fnicollet/Leaflet/pull/21
         */
        _adjustPan: function() {
            if (!this.options.autoPan || (this._map._panAnim && this._map._panAnim._inProgress)) { return; }

            // We can endlessly recurse if keepInView is set and the view resets.
            // Let's guard against that by exiting early if we're responding to our own autopan.
            if (this._autopanning) {
                this._autopanning = false;
                return;
            }

            var map = this._map,
                marginBottom = parseInt(L.DomUtil.getStyle(this._container, 'marginBottom'), 10) || 0,
                containerHeight = this._container.offsetHeight + marginBottom,
                containerWidth = this._containerWidth,
                layerPos = new L.Point(this._containerLeft, -containerHeight - this._containerBottom);

            layerPos._add(L.DomUtil.getPosition(this._container));

            /** @TODO use popupProto._adjustPan */
            // var containerPos = map.layerPointToContainerPoint(layerPos);
            var containerPos = layerPos._add(this._map._getMapPanePos()),
                padding = L.point(this.options.autoPanPadding),
                paddingTL = L.point(this.options.autoPanPaddingTopLeft || padding),
                paddingBR = L.point(this.options.autoPanPaddingBottomRight || padding),
                size = map.getSize(),
                dx = 0,
                dy = 0;

            if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
                dx = containerPos.x + containerWidth - size.x + paddingBR.x;
            }
            if (containerPos.x - dx - paddingTL.x < 0) { // left
                dx = containerPos.x - paddingTL.x;
            }
            if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
                dy = containerPos.y + containerHeight - size.y + paddingBR.y;
            }
            if (containerPos.y - dy - paddingTL.y < 0) { // top
                dy = containerPos.y - paddingTL.y;
            }

            // @namespace Map
            // @section Popup events
            // @event autopanstart: Event
            // Fired when the map starts autopanning when opening a popup.
            if (dx || dy) {
                // Track that we're autopanning, as this function will be re-ran on moveend
                if (this.options.keepInView) {
                    this._autopanning = true;
                }
                map
                    .fire('autopanstart')
                    .panBy([dx, dy]);
            }
        },

    });

    /**
     * @external L.Tooltip
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/Tooltip.js
     */

    const tooltipProto = L.extend({}, L.Tooltip.prototype);

    L.Tooltip.include({

        _animateZoom: function(e) {
            if (!this._map._rotate) {
                return tooltipProto._animateZoom.apply(this, arguments);
            }
            var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);

            pos = this._map.rotatedPointToMapPanePoint(pos);
            this._setPosition(pos);
        },

        _updatePosition: function() {
            if (!this._map._rotate) {
                return tooltipProto._updatePosition.apply(this, arguments);
            }
            var pos = this._map.latLngToLayerPoint(this._latlng);

            pos = this._map.rotatedPointToMapPanePoint(pos);
            this._setPosition(pos);
        },

    });

    /**
     * @external L.Icon
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/marker/Icon.js
     */

    L.extend({}, L.Icon.prototype);

    L.Icon.include({

        _setIconStyles: function(img, name) {
            var options = this.options;
            var sizeOption = options[name + 'Size'];

            if (typeof sizeOption === 'number') {
                sizeOption = [sizeOption, sizeOption];
            }

            var size = L.point(sizeOption),
                anchor = L.point(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
                    size && size.divideBy(2, true));

            img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

            if (anchor) {
                img.style.marginLeft = (-anchor.x) + 'px';
                img.style.marginTop = (-anchor.y) + 'px';
                /** @TODO use iconProto._setIconStyles */
                img.style[L.DomUtil.TRANSFORM + "Origin"] = anchor.x + "px " + anchor.y + "px 0px";
            }

            if (size) {
                img.style.width = size.x + 'px';
                img.style.height = size.y + 'px';
            }
        },

    });

    /**
     * @external L.Marker
     * @external L.Handler.MarkerDrag
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/marker/Marker.js
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/marker/Marker.Drag.js
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/dom/Draggable.js
     */

    const markerProto = L.extend({}, L.Marker.prototype);

    L.Marker.mergeOptions({

        /**
         * Rotation of this marker in rad
         * 
         * @type {Number}
         */
        rotation: 0,

        /**
         * Rotate this marker when map rotates
         * 
         * @type {Boolean}
         */
        rotateWithView: false,

        /**
         * Scale of the marker icon
         * 
         * @type {Number}
         */
        scale: undefined,

    });

    var markerDragProto; // retrived at runtime (see below: L.Marker::_initInteraction())

    var MarkerDrag = {

        // _onDragStart: function() {
        //     if (!this._marker._map._rotate) {
        //         return markerDragProto._onDragStart.apply(this, arguments);
        //     }
        //     this._draggable.updateMapBearing(this._marker._map._bearing);
        // },

        _onDrag: function(e) {
            var marker = this._marker,
                /** @TODO use markerDragProto._onDrag */
                rotated_marker = marker.options.rotation || marker.options.rotateWithView,
                shadow = marker._shadow,
                iconPos = L.DomUtil.getPosition(marker._icon);

            /** @TODO use markerDragProto._onDrag */
            // update shadow position
            if (!rotated_marker && shadow) {
                L.DomUtil.setPosition(shadow, iconPos);
            }

            /** @TODO use markerDragProto._onDrag */
            if (marker._map._rotate) {
                // Reverse calculation from mapPane coordinates to rotatePane coordinates
                iconPos = marker._map.mapPanePointToRotatedPoint(iconPos);
            }
            var latlng = marker._map.layerPointToLatLng(iconPos);

            marker._latlng = latlng;
            e.latlng = latlng;
            e.oldLatLng = this._oldLatLng;

            /** @TODO use markerDragProto._onDrag */
            if (rotated_marker) marker.setLatLng(latlng); // use `setLatLng` to presisit rotation. low efficiency
            else marker.fire('move', e); // `setLatLng` will trig 'move' event. we imitate here.

            // @event drag: Event
            // Fired repeatedly while the user drags the marker.
            marker
                .fire('drag', e);
        },

        _onDragEnd: function(e) {
            if (this._marker._map._rotate) {
                this._marker.update();
            }
            markerDragProto._onDragEnd.apply(this, arguments);
        },

    };

    L.Marker.include({

        /**
         * Update L.Marker anchor position after the map
         * is moved by calling `map.setBearing(theta)`
         * 
         * @listens L.Map~rotate
         */
        getEvents: function() {
            return L.extend(markerProto.getEvents.apply(this, arguments), { rotate: this.update });
        },

        _initInteraction: function() {
            var ret = markerProto._initInteraction.apply(this, arguments);
            if (this.dragging && this.dragging.enabled() && this._map && this._map._rotate) {
                // L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable
                markerDragProto = markerDragProto || Object.getPrototypeOf(this.dragging);
                this.dragging.disable();
                Object.assign(this.dragging, {
                    // _onDragStart: MarkerDrag._onDragStart.bind(this.dragging),
                    _onDrag: MarkerDrag._onDrag.bind(this.dragging),
                    _onDragEnd: MarkerDrag._onDragEnd.bind(this.dragging),
                });
                this.dragging.enable();
            }
            return ret;
        },

        _setPos: function(pos) {

            /** @TODO use markerProto._setPos */
            if (this._map._rotate) {
                pos = this._map.rotatedPointToMapPanePoint(pos);
            }

            /** @TODO use markerProto._setPos */
            var bearing = this.options.rotation || 0;
            if (this.options.rotateWithView) {
                bearing += this._map._bearing;
            }

            /** @TODO use markerProto._setPos */
            if (this._icon) {
                L.DomUtil.setPosition(this._icon, pos, bearing, pos, this.options.scale);
            }

            /** @TODO use markerProto._setPos */
            if (this._shadow) {
                L.DomUtil.setPosition(this._shadow, pos, bearing, pos, this.options.scale);
            }

            this._zIndex = pos.y + this.options.zIndexOffset;

            this._resetZIndex();
        },

        // _updateZIndex: function(offset) {
        //     if (!this._map._rotate) {
        //         return markerProto._updateZIndex.apply(this, arguments);
        //     }
        //     this._icon.style.zIndex = Math.round(this._zIndex + offset);
        // },

        setRotation: function(rotation) {
            this.options.rotation = rotation;
            this.update();
        },

    });

    /**
     * @external L.GridLayer
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/tile/GridLayer.js
     */

    const gridLayerProto = L.extend({}, L.GridLayer.prototype);

    L.GridLayer.include({

        /**
         * Redraw L.TileLayer bounds after the map is
         * moved by just calling `map.setBearing(theta)`
         * 
         * @listens L.Map~rotate
         */
        getEvents: function() {
            var events = gridLayerProto.getEvents.apply(this, arguments);
            if (this._map._rotate && !this.options.updateWhenIdle) {
                if (!this._onRotate) {
                    this._onRotate = L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
                }
                events.rotate = this._onRotate;
            }
            return events;
        },

        _getTiledPixelBounds: function(center) {
            if (!this._map._rotate) {
                return gridLayerProto._getTiledPixelBounds.apply(this, arguments);
            }

            return this._map._getNewPixelBounds(center, this._tileZoom);
        },

    });

    /**
     * @external L.Renderer
     * 
     * @see https://github.com/Leaflet/Leaflet/tree/v1.9.3/src/layer/vector/Renderer.js
     */

    const rendererProto = L.extend({}, L.Renderer.prototype);

    L.Renderer.include({

        /**
         * Redraw L.Canvas and L.SVG renderer bounds after the
         * map is moved by just calling `map.setBearing(theta)`
         * 
         * @listens L.Map~rotate
         */
        getEvents: function() {
            return L.extend(rendererProto.getEvents.apply(this, arguments), { rotate: this._update });
        },

        /**
         * Fix for `map.flyTo()` when `false === map.options.zoomAnimation`
         * 
         * @see https://github.com/Leaflet/Leaflet/pull/8794
         */
        onAdd: function() {
            rendererProto.onAdd.apply(this, arguments);
            if (L.version <= "1.9.3") {
                // always keep transform-origin as 0 0
                this._container.classList.add('leaflet-zoom-animated');
            }
        },

        /**
         * @FIXME layer drifts on `map.setZoom()` (eg. zoom during animation)
         * 
         * the main cause seems to be related to `this._updateTransform(path._center, path._zoom))`
         * and `this._topLeft = this._map.layerPointToLatLng(this._bounds.min);`
         * 
         * @example
         *   map.setZoom(2);
         *   path._renderer._update();
         *   path._renderer._updateTransform(path._renderer._center, path._renderer._zoom);
         * 
         * @see https://github.com/Leaflet/Leaflet/pull/8794
         * @see https://github.com/Leaflet/Leaflet/pull/8103
         * @see https://github.com/Leaflet/Leaflet/issues/7466
         * 
         * @TODO rechek this changes from leaflet@v1.9.3
         * 
         * @see https://github.com/Leaflet/Leaflet/compare/v1.7.0...v1.9.3
         */
        _updateTransform: function(center, zoom) {
            if (!this._map._rotate) {
                return rendererProto._updateTransform.apply(this, arguments);
            }
            /**
             * @FIXME see path._renderer._reset();
             */
            var scale = this._map.getZoomScale(zoom, this._zoom),
                offset = this._map._latLngToNewLayerPoint(this._topLeft, zoom, center);

            L.DomUtil.setTransform(this._container, offset, scale);
            
        },

        // getEvents() {
        //     const events = {
        //         viewreset: this._reset,
        //         zoom: this._onZoom,
        //         moveend: this._update,
        //         zoomend: this._onZoomEnd
        //     };
        //     if (this._zoomAnimated) {
        //         events.zoomanim = this._onAnimZoom;
        //     }
        //     return events;
        // },

        // _onAnimZoom(ev) {
        //     this._updateTransform(ev.center, ev.zoom);
        // },

    	// _onZoom() {
        //     this._updateTransform(this._map.getCenter(), this._map.getZoom());
    	// },

        // _onZoomEnd() {
        //     for (const id in this._layers) {
        //         this._layers[id]._project();
        //     }
        // },

        // _reset() {
        //     this._update();
        //     this._updateTransform(this._center, this._zoom);

        //     for (const id in this._layers) {
        //         this._layers[id]._reset();
        //     }
        // },

        // _updatePaths() {
        //     for (const id in this._layers) {
        //         this._layers[id]._update();
        //     }
        // },

        _update: function() {
            if (!this._map._rotate) {
                return rendererProto._update.apply(this, arguments);
            }
            // Update pixel bounds of renderer container (for positioning/sizing/clipping later)
            // Subclasses are responsible of firing the 'update' event.
            this._bounds = this._map._getPaddedPixelBounds(this.options.padding);
            this._topLeft = this._map.layerPointToLatLng(this._bounds.min);
            this._center = this._map.getCenter();
            this._zoom = this._map.getZoom();
        },

    });

    /**
     * @external L.Map
     * 
     * @see https://github.com/Leaflet/Leaflet/blob/v1.9.3/src/map/Map.js
     */

    const mapProto = L.extend({}, L.Map.prototype);

    L.Map.mergeOptions({ rotate: false, bearing: 0, });

    L.Map.include({

        /**
         * @param {(HTMLElement|String)} id html selector
         * @param {Object} [options={}] leaflet map options
         */
        initialize: function(id, options) {
            if (options.rotate) {
                this._rotate = true;
                this._bearing = 0;
            }
            mapProto.initialize.apply(this, arguments);
            if(this.options.rotate){
              this.setBearing(this.options.bearing);
            }
        },

        /**
         * Given a pixel coordinate relative to the map container,
         * returns the corresponding pixel coordinate relative to
         * the [origin pixel](#map-getpixelorigin).
         * 
         * @param {L.Point} point pixel screen coordinates
         * @returns {L.Point} transformed pixel point
         */
        containerPointToLayerPoint: function(point) {
            if (!this._rotate) {
                return mapProto.containerPointToLayerPoint.apply(this, arguments);
            }
            return L.point(point)
                .subtract(this._getMapPanePos())
                .rotateFrom(-this._bearing, this._getRotatePanePos())
                .subtract(this._getRotatePanePos());
        },

        /**
         * Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
         * returns the corresponding pixel coordinate relative to the map container.
         * 
         * @param {L.Point} point pixel screen coordinates
         * @returns {L.Point} transformed pixel point
         */
        layerPointToContainerPoint: function(point) {
            if (!this._rotate) {
                return mapProto.layerPointToContainerPoint.apply(this, arguments);
            }
            return L.point(point)
                .add(this._getRotatePanePos())
                .rotateFrom(this._bearing, this._getRotatePanePos())
                .add(this._getMapPanePos());
        },

        /**
         * Converts a coordinate from the rotated pane reference system
         * to the reference system of the not rotated map pane.
         * 
         * (rotatePane) --> (mapPane)
         * (rotatePane) --> (norotatePane)
         * 
         * @param {L.Point} point pixel screen coordinates
         * @returns {L.Point}
         * 
         * @since leaflet-rotate (v0.1)
         */
        rotatedPointToMapPanePoint: function(point) {
            return L.point(point)
                .rotate(this._bearing)
                ._add(this._getRotatePanePos());
        },

        /**
         * Converts a coordinate from the not rotated map pane reference system
         * to the reference system of the rotated pane.
         * 
         * (mapPane) --> (rotatePane)
         * (norotatePane) --> (rotatePane)
         * 
         * @param {L.Point} point pixel screen coordinates
         * 
         * @since leaflet-rotate (v0.1)
         */
        mapPanePointToRotatedPoint: function(point) {
            return L.point(point)
                ._subtract(this._getRotatePanePos())
                .rotate(-this._bearing);
        },

        // latLngToLayerPoint: function (latlng) {
        //     var projectedPoint = this.project(L.latLng(latlng))._round();
        //     return projectedPoint._subtract(this.getPixelOrigin());
        // },

        // latLngToContainerPoint: function (latlng) {
    	// 	return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
    	// },

        /**
         * Given latlng bounds, returns the bounds in projected pixel
         * relative to the map container.
         * 
         * @see https://github.com/ronikar/Leaflet/blob/5c480ef959b947c3beed7065425a5a36c486262b/src/map/Map.js#L1114-L1135
         * 
         * @param {L.LatLngBounds} bounds 
         * @returns {L.Bounds}
         * 
         * @since leaflet-rotate (v0.2)
         */
        mapBoundsToContainerBounds: function (bounds) {
            if (!this._rotate && mapProto.mapBoundsToContainerBounds) {
                return mapProto.mapBoundsToContainerBounds.apply(this, arguments);
            }

            // const nw = this.latLngToContainerPoint(bounds.getNorthWest()),
            //       ne = this.latLngToContainerPoint(bounds.getNorthEast()),
            //       sw = this.latLngToContainerPoint(bounds.getSouthWest()),
            //       se = this.latLngToContainerPoint(bounds.getSouthEast());

            // same as `this.latLngToContainerPoint(latlng)` but with floating point precision
            const origin = this.getPixelOrigin();
            const nw = this.layerPointToContainerPoint(this.project(bounds.getNorthWest())._subtract(origin)),
                  ne = this.layerPointToContainerPoint(this.project(bounds.getNorthEast())._subtract(origin)),
                  sw = this.layerPointToContainerPoint(this.project(bounds.getSouthWest())._subtract(origin)),
                  se = this.layerPointToContainerPoint(this.project(bounds.getSouthEast())._subtract(origin));

            return L.bounds([
                L.point(Math.min(nw.x, ne.x, se.x, sw.x), Math.min(nw.y, ne.y, se.y, sw.y)), // [ minX, minY ]
                L.point(Math.max(nw.x, ne.x, se.x, sw.x), Math.max(nw.y, ne.y, se.y, sw.y))  // [ maxX, maxY ]
            ]);
        },

        /**
         * Returns geographical bounds visible in the current map view
         * 
         * @TODO find out  if map bounds calculated by `L.Map::getBounds()`
         *       function should match the `rotatePane` or `norotatePane` bounds
         * 
         * @see https://github.com/fnicollet/Leaflet/issues/7
         * 
         * @returns {L.LatLngBounds}
         */
        getBounds: function() {
            if (!this._rotate) {
                return mapProto.getBounds.apply(this, arguments);
            }

            // SEE: https://github.com/fnicollet/Leaflet/pull/22
            //
            // var bounds = this.getPixelBounds(),
            // sw = this.unproject(bounds.getBottomLeft()),
            // ne = this.unproject(bounds.getTopRight());
            // return new LatLngBounds(sw, ne);
            //

            // LatLngBounds' constructor automatically
            // extends the bounds to fit the passed points
            var size = this.getSize();
            return new L.LatLngBounds([
                this.containerPointToLatLng([0, 0]),           // topleft
                this.containerPointToLatLng([size.x, 0]),      // topright 
                this.containerPointToLatLng([size.x, size.y]), // bottomright
                this.containerPointToLatLng([0, size.y]),      // bottomleft
            ]);
        },

        /**
         * Returns the bounds of the current map view in projected pixel
         * coordinates (sometimes useful in layer and overlay implementations).
         * 
         * @TODO find out if map bounds calculated by `L.Map::getPixelBounds()`
         *       function should match the `rotatePane` or `norotatePane` bounds
         *
         * @see https://github.com/fnicollet/Leaflet/issues/7
         * 
         * @returns {L.Bounds}
         */
        // getPixelBounds(center, zoom) {
        //     // const topLeftPoint = map.containerPointToLayerPoint(this._getTopLeftPoint());
        //     const topLeftPoint = this._getTopLeftPoint(center, zoom);
        //       return new L.Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
        // },

        /**
         * Change map rotation
         * 
         * @param {number} theta map degrees
         * 
         * @since leaflet-rotate (v0.1)
         */
        setBearing: function(theta) {
            if (!L.Browser.any3d || !this._rotate) { return; }

            var bearing = L.Util.wrapNum(theta, [0, 360]) * L.DomUtil.DEG_TO_RAD,
                center = this._getPixelCenter(),
                oldPos = this._getRotatePanePos().rotateFrom(-this._bearing, center),
                newPos = oldPos.rotateFrom(bearing, center);

            // CSS transform
            L.DomUtil.setPosition(this._rotatePane, oldPos, bearing, center);

            this._pivot = center;
            this._bearing = bearing;
            this._rotatePanePos = newPos;

            this.fire('rotate');
        },

        /**
         * Get current map rotation
         * 
         * @returns {number} theta map degrees
         * 
         * @since leaflet-rotate (v0.1)
         */
        getBearing: function() {
            return this._bearing * L.DomUtil.RAD_TO_DEG;
        },

        /**
         * Creates a new [map pane](#map-pane) with the given name if it doesn't
         * exist already, then returns it. The pane is created as a child of
         * `container`, or as a child of the main map pane if not set.
         * 
         * @param {String} name leaflet pane
         * @param {HTMLElement} [container] parent element
         * @returns {HTMLElement} pane container
         */
        // createPane: function(name, container) {
        //     if (!this._rotate || name == 'mapPane') {
        //         return mapProto.createPane.apply(this, arguments);
        //     }
        //     // init "rotatePane"
        //     if (!this._rotatePane) {
        //         // this._pivot = this.getSize().divideBy(2);
        //         this._rotatePane = mapProto.createPane.call(this, 'rotatePane', this._mapPane);
        //         L.DomUtil.setPosition(this._rotatePane, new L.Point(0, 0), this._bearing, this._pivot);
        //     }
        //     return mapProto.createPane.call(this, name, container || this._rotatePane);
        // },

        /**
         * Panes are DOM elements used to control the ordering of layers on
         * the map. You can access panes with [`map.getPane`](#map-getpane)
         * or [`map.getPanes`](#map-getpanes) methods. New panes can be created
         * with the [`map.createPane`](#map-createpane) method.
         * 
         * Every map has the following default panes that differ only in zIndex:
         * 
         * - mapPane     [HTMLElement = 'auto'] - Pane that contains all other map panes
         * - tilePane    [HTMLElement = 2]      - Pane for tile layers
         * - overlayPane [HTMLElement = 4]      - Pane for overlays like polylines and polygons
         * - shadowPane  [HTMLElement = 5]      - Pane for overlay shadows (e.g. marker shadows)
         * - markerPane  [HTMLElement = 6]      - Pane for marker icons
         * - tooltipPane [HTMLElement = 650]    - Pane for tooltips.
         * - popupPane   [HTMLElement = 700]    - Pane for popups.
         */
        _initPanes: function() {
            var panes = this._panes = {};
            this._paneRenderers = {};

            this._mapPane = this.createPane('mapPane', this._container);
            L.DomUtil.setPosition(this._mapPane, new L.Point(0, 0));

            if (this._rotate) {
                this._rotatePane = this.createPane('rotatePane', this._mapPane);
                this._norotatePane = this.createPane('norotatePane', this._mapPane);
                // rotatePane
                this.createPane('tilePane', this._rotatePane);
                this.createPane('overlayPane', this._rotatePane);
                // norotatePane
                this.createPane('shadowPane', this._norotatePane);
                this.createPane('markerPane', this._norotatePane);
                this.createPane('tooltipPane', this._norotatePane);
                this.createPane('popupPane', this._norotatePane);
            } else {
                this.createPane('tilePane');
                this.createPane('overlayPane');
                this.createPane('shadowPane');
                this.createPane('markerPane');
                this.createPane('tooltipPane');
                this.createPane('popupPane');
            }

            if (!this.options.markerZoomAnimation) {
                L.DomUtil.addClass(panes.markerPane, 'leaflet-zoom-hide');
                L.DomUtil.addClass(panes.shadowPane, 'leaflet-zoom-hide');
            }
        },

        /**
         * Pans the map the minimum amount to make the `latlng` visible. Use
         * padding options to fit the display to more restricted bounds.
         * If `latlng` is already within the (optionally padded) display bounds,
         * the map will not be panned.
         * 
         * @see https://github.com/Raruto/leaflet-rotate/issues/18
         * 
         * @param {L.LatLng} latlng coordinates
         * @param {Object} [options={}] padding options
         * 
         * @returns {L.Map} current map instance
         */
        panInside(latlng, options) {
            if (!this._rotate || Math.abs(this._bearing).toFixed(1) < 0.1) {
                return mapProto.panInside.apply(this, arguments);
            }

            options = options || {};

            const paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
                paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),
                /** @TODO use mapProto.panInside */
                // pixelPoint = this.project(latlng),
                // pixelBounds = this.getPixelBounds(),
                // pixelCenter = this.project(this.getCenter()),
                rect = this._container.getBoundingClientRect(),
                pixelPoint = this.latLngToContainerPoint(latlng),
                pixelBounds = L.bounds([ L.point(rect), L.point(rect).add(this.getSize()) ]),
                pixelCenter = pixelBounds.getCenter(),
                //
                paddedBounds = L.bounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]),
                paddedSize = paddedBounds.getSize();
            
            if (!paddedBounds.contains(pixelPoint)) {
                this._enforcingBounds = true;
                const centerOffset = pixelPoint.subtract(paddedBounds.getCenter());
                const offset = paddedBounds.extend(pixelPoint).getSize().subtract(paddedSize);
                pixelCenter.x += centerOffset.x < 0 ? -offset.x : offset.x;
                pixelCenter.y += centerOffset.y < 0 ? -offset.y : offset.y;
                /** @TODO use mapProto.panInside */
                // this.panTo(this.unproject(pixelCenter), options);
                this.panTo(this.containerPointToLatLng(pixelCenter), options);
                //
                this._enforcingBounds = false;
            }
            return this;
        },

        /**
         * Pans the map to the closest view that would lie inside the given bounds
         * (if it's not already), controlling the animation using the options specific,
         * if any.
         * 
         * @TODO check if map bounds calculated by `L.Map::panInsideBounds()`
         *       function should match the `rotatePane` or `norotatePane` bounds
         *
         * @see https://github.com/fnicollet/Leaflet/issues/7
         * 
         * @param {L.LatLngBounds} bounds coordinates
         * @param {Object} [options] pan options
         * @returns {L.Map} current map instance
         */
        // panInsideBounds: function (bounds, options) {
        //     this._enforcingBounds = true;
        //     var center = this.getCenter(),
        //         newCenter = this._limitCenter(center, this._zoom, L.latLngBounds(bounds));
        //
        //     if (!center.equals(newCenter)) {
        //         this.panTo(newCenter, options);
        //     }
        //
        //     this._enforcingBounds = false;
        //     return this;
        // },

        // adjust center for view to get inside bounds
        // _limitCenter(center, zoom, bounds) {
        //
        //     if (!bounds) { return center; }
        //
        //     const centerPoint = this.project(center, zoom),
        //         viewHalf = this.getSize().divideBy(2),
        //         viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
        //         offset = this._getBoundsOffset(viewBounds, bounds, zoom);
        //
        //     // If offset is less than a pixel, ignore.
        //     // This prevents unstable projections from getting into
        //     // an infinite loop of tiny offsets.
        //     if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
        //             return center;
        //     }
        //
        //     return this.unproject(centerPoint.add(offset), zoom);
        // },

        // @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
        // Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
        // but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
        // flyToBounds(bounds, options) {
        //     const target = this._getBoundsCenterZoom(bounds, options);
        //     return this.flyTo(target.center, target.zoom, options);
        // },

        // _getBoundsCenterZoom(bounds, options) {
        //
        //     options = options || {};
        //     bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);
        //
        //     const paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
        //           paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]);
        //
        //     let zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));
        //
        //     zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;
        //
        //     if (zoom === Infinity) {
        //         return { center: bounds.getCenter(), zoom };
        //     }
        //
        //     return { center, zoom };
        //
        // },

        /**
         * Returns the maximum zoom level on which the given bounds fit to the map
         * view in its entirety. If `inside` (optional) is set to `true`, the method
         * instead returns the minimum zoom level on which the map view fits into
         * the given bounds in its entirety.
         * 
         * @param {L.LatLngBounds} bounds
         * @param {Boolean} [inside=false]
         * @param {L.Point} [padding=[0,0]]
         * 
         * @returns {Number} zoom level
         */
        getBoundsZoom(bounds, inside, padding) {
            if (!this._rotate || Math.abs(this._bearing).toFixed(1) < 0.1) {
                return mapProto.getBoundsZoom.apply(this, arguments);
            }

            bounds = L.latLngBounds(bounds);
            padding = L.point(padding || [0, 0]);

            let zoom = this.getZoom() || 0;
            const min = this.getMinZoom(),
                    max = this.getMaxZoom(),
                    /** @TODO use mapProto.getBoundsZoom */
                    // nw = bounds.getNorthWest(),
                    // se = bounds.getSouthEast(),
                    // size = this.getSize().subtract(padding),
                    // boundsSize = L.bounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
                    size = this.getSize().subtract(padding),
                    boundsSize = this.mapBoundsToContainerBounds(bounds).getSize(),
                    snap = this.options.zoomSnap,
                    scalex = size.x / boundsSize.x,
                    scaley = size.y / boundsSize.y,
                    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

            zoom = this.getScaleZoom(scale, zoom);

            if (snap) {
                zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
                zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
            }

            return Math.max(min, Math.min(max, zoom));
        },

        /**
         * Layer point of the current center
         * 
         * @returns {L.Point} layer center
         */
        // _getCenterLayerPoint: function () {
        //    return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
        // },

        /**
         * Offset of the specified place to the current center in pixels
         * 
         * @param {L.LatLng} latlng map coordinates
         */
        _getCenterOffset: function(latlng) {
            var centerOffset = mapProto._getCenterOffset.apply(this, arguments);
            if (this._rotate) {
                centerOffset = centerOffset.rotate(this._bearing);
            }
            return centerOffset;
        },

        /**
         * @since leaflet-rotate (v0.1)
         */
        _getRotatePanePos: function() {
            return this._rotatePanePos || new L.Point(0, 0);
            // return L.DomUtil.getPosition(this._rotatePane) || new L.Point(0, 0);
        },

        // _latLngToNewLayerPoint(latlng, zoom, center) {
        //    const topLeft = this._getNewPixelOrigin(center, zoom);
        //    return this.project(latlng, zoom)._subtract(topLeft);
        //},

        _getNewPixelOrigin: function(center, zoom) {
            if (!this._rotate) {
                return mapProto._getNewPixelOrigin.apply(this, arguments);
            }
            var viewHalf = this.getSize()._divideBy(2);
            return this.project(center, zoom)
                .rotate(this._bearing)
                ._subtract(viewHalf)
                ._add(this._getMapPanePos())
                ._add(this._getRotatePanePos())
                .rotate(-this._bearing)
                ._round();
        },

        /**
         * @since leaflet-rotate (v0.2)
         * 
         * @see src\layer\tile\GridLayer::_getTiledPixelBounds()
         */
        _getNewPixelBounds: function(center, zoom) {
            center = center || this.getCenter();
            zoom = zoom || this.getZoom();
            if (!this._rotate && mapProto._getNewPixelBounds) {
                return mapProto._getNewPixelBounds.apply(this, arguments);
            }
            var mapZoom = this._animatingZoom ? Math.max(this._animateToZoom, this.getZoom()) : this.getZoom(),
                scale = this.getZoomScale(mapZoom, zoom),
                pixelCenter = this.project(center, zoom).floor(),
                size = this.getSize(),
                halfSize = new L.Bounds([
                    this.containerPointToLayerPoint([0, 0]).floor(),
                    this.containerPointToLayerPoint([size.x, 0]).floor(),
                    this.containerPointToLayerPoint([0, size.y]).floor(),
                    this.containerPointToLayerPoint([size.x, size.y]).floor()
                ]).getSize().divideBy(scale * 2);

            return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
        },

        /**
         * @since leaflet-rotate (v0.2)
         * 
         * @return {L.Point} map pivot point (center)
         */
        _getPixelCenter: function() {
            if (!this._rotate && mapProto._getPixelCenter) {
                return mapProto._getPixelCenter.apply(this, arguments);
            }
            return this.getSize()._divideBy(2)._subtract(this._getMapPanePos());
        },

        /**
         * @since leaflet-rotate (v0.2)
         * 
         * @see src\layer\vector\Renderer::_update()
         */
        _getPaddedPixelBounds: function(padding) {
            if (!this._rotate && mapProto._getPaddedPixelBounds) {
                return mapProto._getPaddedPixelBounds.apply(this, arguments);
            }
            var p = padding,
                size = this.getSize(),
                padMin = size.multiplyBy(-p),
                padMax = size.multiplyBy(1 + p);
                //min = this.containerPointToLayerPoint(size.multiplyBy(-p)).round();

            return new L.Bounds([
                this.containerPointToLayerPoint([padMin.x, padMin.y]).floor(),
                this.containerPointToLayerPoint([padMin.x, padMax.y]).floor(),
                this.containerPointToLayerPoint([padMax.x, padMin.y]).floor(),
                this.containerPointToLayerPoint([padMax.x, padMax.y]).floor()
            ]);
        },

        _handleGeolocationResponse: function(pos) {
            if (!this._container._leaflet_id) { return; }

            var lat = pos.coords.latitude,
                lng = pos.coords.longitude,
                /** @TODO use mapProto._handleGeolocationResponse */
                hdg = pos.coords.heading,
                latlng = new L.LatLng(lat, lng),
                bounds = latlng.toBounds(pos.coords.accuracy),
                options = this._locateOptions;

            if (options.setView) {
                var zoom = this.getBoundsZoom(bounds);
                this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
            }

            var data = {
                latlng: latlng,
                bounds: bounds,
                timestamp: pos.timestamp,
                /** @TODO use mapProto._handleGeolocationResponse */
                heading: hdg
            };

            for (var i in pos.coords) {
                if (typeof pos.coords[i] === 'number') {
                    data[i] = pos.coords[i];
                }
            }

            // @event locationfound: LocationEvent
            // Fired when geolocation (using the [`locate`](#map-locate) method)
            // went successfully.
            this.fire('locationfound', data);
        },

        /**
         * @see https://github.com/ronikar/Leaflet/blob/5c480ef959b947c3beed7065425a5a36c486262b/src/geo/LatLngBounds.js#L253-L264
         * 
         * @param {L.Bounds} points 
         * @returns {L.Bounds}
         */
        // toCircumscribedBounds(points) {
        //     var minX = points.reduce(function (pv, v) { return Math.min(pv, v.x); }, points[0].x),
        //         maxX = points.reduce(function (pv, v) { return Math.max(pv, v.x); }, points[0].x),
        //         minY = points.reduce(function (pv, v) { return Math.min(pv, v.y); }, points[0].y),
        //         maxY = points.reduce(function (pv, v) { return Math.max(pv, v.y); }, points[0].y);
        //
        //     return L.bounds(L.point(minX, minY), L.point(maxX, maxY));
        // },

    });

    /**
     * Rotates the map according to a smartphone's compass.
     * 
     * @typedef L.Map.CompassBearing
     */

    L.Map.CompassBearing = L.Handler.extend({

        initialize: function(map) {
            this._map = map;
            /** @see https://caniuse.com/?search=DeviceOrientation */
            if ('ondeviceorientationabsolute' in window) {
                this.__deviceOrientationEvent = 'deviceorientationabsolute';
            } else if('ondeviceorientation' in window) {
                this.__deviceOrientationEvent = 'deviceorientation';
            }
            this._throttled = L.Util.throttle(this._onDeviceOrientation, 100, this);
        },

        addHooks: function() {
            if (this._map._rotate && this.__deviceOrientationEvent) {
                L.DomEvent.on(window, this.__deviceOrientationEvent, this._throttled, this);
            } else {
                // L.Map.CompassBearing handler will be automatically
                // disabled if device orientation is not supported.
                this.disable();
            }
        },

        removeHooks: function() {
            if (this._map._rotate && this.__deviceOrientationEvent) {
                L.DomEvent.off(window, this.__deviceOrientationEvent, this._throttled, this);
            }
        },

        /**
         * `DeviceOrientationEvent.absolute` - Indicates whether the device is providing absolute
         *                                     orientation values (relatives to Magnetic North) or
         *                                     using some arbitrary frame determined by the device.
         * 
         * `DeviceOrientationEvent.alpha`    - Returns the rotation of the device around the Z axis;
         *                                     that is, the number of degrees by which the device is
         *                                     being twisted around the center of the screen.
         * 
         * `window.orientation`              - Returns the screen orientation in degrees (in 90-degree increments)
         *                                     of the viewport relative to the device's natural orientation.
         *                                     Its only possible values are -90, 0, 90, and 180. Positive
         *                                     values are counterclockwise; negative values are clockwise.
         * 
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/absolute
         * @see https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/alpha
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/orientation
         */
        _onDeviceOrientation: function(e) {
            var angle = e.webkitCompassHeading || e.alpha;
            var deviceOrientation = 0;

            // Safari iOS
            if (!e.absolute && e.webkitCompassHeading) {
                angle = 360 - angle;
            }

            // Older browsers
            if (!e.absolute && 'undefined' !== typeof window.orientation) {
                deviceOrientation = window.orientation;
            }

            this._map.setBearing(angle - deviceOrientation);
        },

    });

    /**
     * Add Compass bearing handler to L.Map (disabled unless `window.DeviceOrientationEvent` is set).
     * 
     * @property {L.Map.CompassBearing} compassBearing
     */
    L.Map.addInitHook('addHandler', 'compassBearing', L.Map.CompassBearing);

    /**
     * Triggers `invalidateResize` when the map's DOM container mutates.
     * 
     * @typedef L.Map.ContainerMutation
     */

    /**
     * @TODO check again this file after leaflet v1.9.3 (eg. L.Browser.mutation).
     * Mutation Observer support will likely be added by default in next releases.
     */

    L.Map.mergeOptions({

        /**
         * Whether the map uses mutation observers to
         * detect changes in its container and trigger
         * `invalidateSize`. Disabled by default due to
         * support not being available in all web browsers.
         *
         * @type {Boolean}
         * 
         * @see https://developer.mozilla.org/docs/Web/API/MutationObserver
         */
        trackContainerMutation: false

    });

    L.Map.ContainerMutation = L.Handler.extend({

        addHooks: function() {
            // if (!L.Browser.mutation) { return; }
            if (!this._observer) {
                this._observer = new MutationObserver(L.Util.bind(this._map.invalidateSize, this._map));
            }
            this._observer.observe(this._map.getContainer(), {
                childList: false,
                attributes: true,
                characterData: false,
                subtree: false,
                attributeFilter: ['style']
            });
        },

        removeHooks: function() {
            // if (!L.Browser.mutation) { return; }
            this._observer.disconnect();
        },

    });

    /**
     * Add Container mutation handler to L.Map (disabled unless `trackContainerMutation` is set).
     * 
     * @property {L.Map.ContainerMutation} trackContainerMutation
     */
    L.Map.addInitHook('addHandler', 'trackContainerMutation', L.Map.ContainerMutation);

    /**
     * TouchGestures is both TouchZoom plus TouchRotate
     * 
     * @see https://github.com/fnicollet/Leaflet/commit/a77af51a6b10f308d1b9a16552091d1d0aee8834
     * @see https://github.com/Leaflet/Leaflet/blob/v1.9.3/src/map/handler/Map.TouchZoom.js
     * 
     * @typedef L.Map.TouchGestures
     */

    L.Map.mergeOptions({

        /**
         * Set it to false if you don't want the map to
         * zoom beyond min/max zoom and then bounce back
         * when pinch-zooming.
         * 
         * @type {Boolean}
         */
        bounceAtZoomLimits: true,

    });

    L.Map.TouchGestures = L.Handler.extend({

        initialize: function(map) {
            this._map = map;
            this.rotate = !!this._map.options.touchRotate;
            this.zoom = !!this._map.options.touchZoom;
        },

        addHooks: function() {
            L.DomEvent.on(this._map._container, 'touchstart', this._onTouchStart, this);
        },

        removeHooks: function() {
            L.DomEvent.off(this._map._container, 'touchstart', this._onTouchStart, this);
        },

        _onTouchStart: function(e) {
            var map = this._map;

            if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming || this._rotating) { return; }

            var p1 = map.mouseEventToContainerPoint(e.touches[0]),
                p2 = map.mouseEventToContainerPoint(e.touches[1]),
                vector = p1.subtract(p2);

            this._centerPoint = map.getSize()._divideBy(2);
            this._startLatLng = map.containerPointToLatLng(this._centerPoint);

            if (this.zoom) {
                if (map.options.touchZoom !== 'center') {
                    this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
                }
                this._startDist = p1.distanceTo(p2);
                this._startZoom = map.getZoom();
                this._zooming = true;
            } else {
                this._zooming = false;
            }

            if (this.rotate) {
                this._startTheta = Math.atan(vector.x / vector.y);
                this._startBearing = map.getBearing();
                if (vector.y < 0) { this._startBearing += 180; }
                this._rotating = true;
            } else {
                this._rotating = false;
            }

            this._moved = false;

            map._stop();

            L.DomEvent
                .on(document, 'touchmove', this._onTouchMove, this)
                .on(document, 'touchend touchcancel', this._onTouchEnd, this);

            L.DomEvent.preventDefault(e);
        },

        _onTouchMove: function(e) {
            if (!e.touches || e.touches.length !== 2 || !(this._zooming || this._rotating)) { return; }

            var map = this._map,
                p1 = map.mouseEventToContainerPoint(e.touches[0]),
                p2 = map.mouseEventToContainerPoint(e.touches[1]),
                vector = p1.subtract(p2),
                scale = p1.distanceTo(p2) / this._startDist,
                delta;

            if (this._rotating) {
                var theta = Math.atan(vector.x / vector.y);
                var bearingDelta = (theta - this._startTheta) * L.DomUtil.RAD_TO_DEG;
                if (vector.y < 0) { bearingDelta += 180; }
                if (bearingDelta) {
                    /**
                     * @TODO the pivot should be the last touch point,
                     * but zoomAnimation manages to overwrite the rotate
                     * pane position. Maybe related to #3529.
                     * 
                     * @see https://github.com/Leaflet/Leaflet/pull/3529
                     * @see https://github.com/fnicollet/Leaflet/commit/a77af51a6b10f308d1b9a16552091d1d0aee8834
                     */
                    map.setBearing(this._startBearing - bearingDelta);
                }
            }

            if (this._zooming) {
                this._zoom = map.getScaleZoom(scale, this._startZoom);

                if (!map.options.bounceAtZoomLimits && (
                        (this._zoom < map.getMinZoom() && scale < 1) ||
                        (this._zoom > map.getMaxZoom() && scale > 1))) {
                    this._zoom = map._limitZoom(this._zoom);
                }

                if (map.options.touchZoom === 'center') {
                    this._center = this._startLatLng;
                    if (scale === 1) { return; }
                } else {
                    // Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
                    delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
                    if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }

                    var alpha = -map.getBearing() * L.DomUtil.DEG_TO_RAD;

                    this._center = map.unproject(map.project(this._pinchStartLatLng).subtract(delta.rotate(alpha)));
                }

            }

            if (!this._moved) {
                map._moveStart(true, false);
                this._moved = true;
            }

            L.Util.cancelAnimFrame(this._animRequest);

            var moveFn = map._move.bind(map, this._center, this._zoom, { pinch: true, round: false }, undefined);
            this._animRequest = L.Util.requestAnimFrame(moveFn, this, true);

            L.DomEvent.preventDefault(e);
        },

        _onTouchEnd: function() {
            if (!this._moved || !(this._zooming || this._rotating)) {
                this._zooming = false;
                return;
            }

            this._zooming = false;
            this._rotating = false;
            L.Util.cancelAnimFrame(this._animRequest);

            L.DomEvent
                .off(document, 'touchmove', this._onTouchMove, this)
                .off(document, 'touchend touchcancel', this._onTouchEnd, this);

            if (this.zoom) {
                // Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
                if (this._map.options.zoomAnimation) {
                    this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
                } else {
                    this._map._resetView(this._center, this._map._limitZoom(this._zoom));
                }
            }
        },

    });

    /**
     * Add Touch Gestures handler (enabled unless `touchGestures` is unset).
     * 
     * @property {L.Map.TouchGestures} touchGestures
     */
    L.Map.addInitHook('addHandler', 'touchGestures', L.Map.TouchGestures);

    /**
     * Rotates the map on two-finger (touch devices).
     * 
     * @typedef L.Map.TouchRotate
     */

    L.Map.mergeOptions({

        /**
         * Whether the map can be rotated with a two-finger rotation gesture
         * 
         * @type {Boolean}
         */
        touchRotate: false,

    });

    L.Map.TouchRotate = L.Handler.extend({

        addHooks: function() {
            this._map.touchGestures.enable();
            this._map.touchGestures.rotate = true;
        },

        removeHooks: function() {
            this._map.touchGestures.rotate = false;
        },

    });

    /**
     * Add Touch Rotate handler (disabled unless `touchGestures` is set).
     * 
     * @property {L.Map.TouchGestures} touchGestures
     */
    L.Map.addInitHook('addHandler', 'touchRotate', L.Map.TouchRotate);

    /**
     * Rotates the map on shift key + mousewheel scrolling (desktop).
     * 
     * @typedef L.Map.ShiftKeyRotate
     */

    L.Map.mergeOptions({

        /**
         * Whether the map can be rotated with shift + wheel scroll
         * @type {Boolean}
         */
        shiftKeyRotate: true,

    });

    L.Map.ShiftKeyRotate = L.Handler.extend({

        addHooks: function() {
            L.DomEvent.on(this._map._container, "wheel", this._handleShiftScroll, this);
            // this._map.shiftKeyRotate.enable();
            this._map.shiftKeyRotate.rotate = true;
        },

        removeHooks: function() {
            L.DomEvent.off(this._map._container, "wheel", this._handleShiftScroll, this);
            this._map.shiftKeyRotate.rotate = false;
        },

        _handleShiftScroll: function(e) {
            if (e.shiftKey) {
                e.preventDefault();
                this._map.scrollWheelZoom.disable();
                this._map.setBearing((this._map._bearing * L.DomUtil.RAD_TO_DEG) + Math.sign(e.deltaY) * 5);
            } else {
                this._map.scrollWheelZoom.enable();
            }
        },

    });

    /**
     * Add ShiftKey handler to L.Map (enabled unless `shiftKeyRotate` is unset).
     * 
     * @property {L.Map.ShiftKeyRotate} shiftKeyRotate
     */
    L.Map.addInitHook('addHandler', 'shiftKeyRotate', L.Map.ShiftKeyRotate);

    // decrease `scrollWheelZoom` handler priority over `shiftKeyRotate` handler
    L.Map.addInitHook(function() {
        if (this.scrollWheelZoom.enabled() && this.shiftKeyRotate.enabled()) {
            this.scrollWheelZoom.disable();
            this.scrollWheelZoom.enable();
        }
    });

    /**
     * Adds pinch zoom rotation on mobile browsers
     * 
     * @see https://github.com/Leaflet/Leaflet/blob/v1.9.3/src/map/handler/Map.TouchZoom.js
     * 
     * @external L.Map.TouchZoom
     */

    L.Map.mergeOptions({

        /**
         * Whether the map can be zoomed by touch-dragging
         * with two fingers. If passed `'center'`, it will
         * zoom to the center of the view regardless of
         * where the touch events (fingers) were. Enabled
         * for touch-capable web browsers.
         * 
         * @type {(Boolean|String)}
         */
        touchZoom: L.Browser.touch,

        /**
         * @TODO check if this is a duplicate of `L.Map.TouchGestures::bounceAtZoomLimits`
         * 
         * Set it to false if you don't want the map to
         * zoom beyond min/max zoom and then bounce back
         * when pinch-zooming.
         * 
         * @type {Boolean}
         */
        bounceAtZoomLimits: false,

    });

    L.Map.TouchZoom = L.Handler.extend({

        addHooks: function() {
            L.DomUtil.addClass(this._map._container, 'leaflet-touch-zoom');
            this._map.touchGestures.enable();
            this._map.touchGestures.zoom = true;
        },

        removeHooks: function() {
            L.DomUtil.removeClass(this._map._container, 'leaflet-touch-zoom');
            this._map.touchGestures.zoom = false;
        },

    });

    /**
     * Add Touch Zoom handler (disabled unless `L.Browser.touch` is set).
     * 
     * @property {L.Map.TouchGestures} touchGestures
     */
    L.Map.addInitHook('addHandler', 'touchZoom', L.Map.TouchZoom);

    /**
     * A tri-state control for map rotation, states are:
     * 
     * - Locked (default)
     * - Unlocked (user can pinch-rotate)
     * - Follow (rotation follows device orientation, if available)
     * 
     * @typedef L.Control.Rotate
     */

    L.Control.Rotate = L.Control.extend({

        options: {
            position: 'topleft',
            closeOnZeroBearing: true
        },

        onAdd: function(map) {
            var container = this._container = L.DomUtil.create('div', 'leaflet-control-rotate leaflet-bar');

            // this.button = L.Control.Zoom.prototype._createButton.call(this, 'R', 'leaflet-control-rotate', 'leaflet-control-rotate', container, this._toggleLock);

            var arrow = this._arrow = L.DomUtil.create('span', 'leaflet-control-rotate-arrow');

            arrow.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,%3Csvg width='29' height='29' viewBox='0 0 29 29' xmlns='http://www.w3.org/2000/svg' fill='%23333'%3E%3Cpath d='M10.5 14l4-8 4 8h-8z'/%3E%3Cpath d='M10.5 16l4 8 4-8h-8z' fill='%23ccc'/%3E%3C/svg%3E")`;
            arrow.style.cursor = 'grab';
            arrow.style.display = 'block';
            arrow.style.width = '100%';
            arrow.style.height = '100%';
            arrow.style.backgroundRepeat = 'no-repeat';
            arrow.style.backgroundPosition = '50%';

            // Copy-pasted from L.Control.Zoom
            var link = this._link = L.DomUtil.create('a', 'leaflet-control-rotate-toggle', container);
            link.appendChild(arrow);
            link.href = '#';
            link.title = 'Rotate map';

            L.DomEvent
                .on(link, 'dblclick', L.DomEvent.stopPropagation)
                .on(link, 'mousedown', this._handleMouseDown, this)
                .on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', this._cycleState, this)
                .on(link, 'click', this._refocusOnMap, this);

            if (!L.Browser.any3d) {
                L.DomUtil.addClass(link, 'leaflet-disabled');
            }

            this._restyle();

            map.on('rotate', this._restyle, this);

            // State flag
            this._follow = false;
            this._canFollow = false;

            if (this.options.closeOnZeroBearing && map.getBearing() === 0) {
                container.style.display = 'none';
            }

            return container;
        },
        
        onRemove: function(map) {
            map.off('rotate', this._restyle, this);
        },

        _handleMouseDown: function(e) {
            L.DomEvent.stop(e);
            this.dragging = true;
            this.dragstartX = e.pageX;
            this.dragstartY = e.pageY;
            L.DomEvent
                .on(document, 'mousemove', this._handleMouseDrag, this)
                .on(document, 'mouseup', this._handleMouseUp, this);
        },

        _handleMouseUp: function(e) {
            L.DomEvent.stop(e);
            this.dragging = false;

            L.DomEvent
                .off(document, 'mousemove', this._handleMouseDrag, this)
                .off(document, 'mouseup', this._handleMouseUp, this);
        },

        _handleMouseDrag: function(e) {
            if (!this.dragging) { return; }
            var deltaX = e.clientX - this.dragstartX;
            this._map.setBearing(deltaX);
        },

        _cycleState: function(ev) {
            if (!this._map) {
                return;
            }

            var map = this._map;

            // Touch mode
            if (!map.touchRotate.enabled() && !map.compassBearing.enabled()) {
                map.touchRotate.enable();
            }
            
            // Compass mode
            else if (!map.compassBearing.enabled()) {
                map.touchRotate.disable();
                map.compassBearing.enable();
            }

            // Locked mode
            else {
                map.compassBearing.disable();
                map.setBearing(0);
                if (this.options.closeOnZeroBearing) {
                    map.touchRotate.enable();
                }
            }
            this._restyle();
        },

        _restyle: function() {
            if (!this._map.options.rotate) {
                L.DomUtil.addClass(this._link, 'leaflet-disabled');
            } else {
                var map = this._map;
                var bearing = map.getBearing();

                this._arrow.style.transform = 'rotate(' + bearing + 'deg)';

                if (bearing && this.options.closeOnZeroBearing) {
                    this._container.style.display = 'block';
                }

                // Compass mode
                if (map.compassBearing.enabled()) {
                    this._link.style.backgroundColor = 'orange';
                }
                
                // Touch mode
                else if (map.touchRotate.enabled()) {
                    this._link.style.backgroundColor = null;
                }

                // Locked mode
                else {
                    this._link.style.backgroundColor = 'grey';
                    if (0 === bearing && this.options.closeOnZeroBearing) {
                        this._container.style.display = 'none';
                    }
                }
            }
        },

    });

    L.control.rotate = function(options) {
        return new L.Control.Rotate(options);
    };

    L.Map.mergeOptions({
        rotateControl: true,
    });

    L.Map.addInitHook(function() {
        if (this.options.rotateControl) {
            var options = typeof this.options.rotateControl === 'object' ? this.options.rotateControl : {};
            this.rotateControl = L.control.rotate(options);
            this.addControl(this.rotateControl);
        }
    });

}));
//# sourceMappingURL=leaflet-rotate-src.js.map
