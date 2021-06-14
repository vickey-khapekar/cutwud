(function(wpElement, wpBlocks, wpComponents, wpEditor, wpi18n){
    let __ = wpi18n.__;
    let el = wpElement.createElement;
    let registerBlockType = wpBlocks.registerBlockType;
    let richText = wpEditor.RichText;
    let InspectorControls = wpEditor.InspectorControls;
    let button = wp.components.Button;
    let PanelBody = wpComponents.PanelBody;
    let SelectControl = wpComponents.SelectControl;
    let ToggleControl = wpComponents.ToggleControl;
    let TextControl = wpComponents.TextControl;
    let RadioControl = wpComponents.RadioControl;


    function getProfiles(props){
        let profiles = [];
        let tmpArr = [{label: 'Default', value: ''}];

        try {
            profiles = JSON.parse(props.attributes.profilesJsonStr);
        } catch(e) {
            //code here
            return tmpArr;
        }

        if(profiles.length > 0){
            //tmpArr.push({label: 'Default', value: ''});

            for (let i = 0; i < profiles.length; i++) {
                tmpArr.push({label: profiles[i], value: profiles[i]});
            }
        }

        return tmpArr;
    }


    function generateOptionsUriStr(optObject){
        let uriStr = '';
        let isFirst = true;

        for( let option in optObject ){
            if( optObject.hasOwnProperty( option ) ) {
                if( !!optObject[option] ){
                    uriStr += isFirst == true ? '?' + option + '=' + optObject[option] : '&' + option + '=' + optObject[option];
                    isFirst = false;
                }
            }
        }

        return uriStr;
    }


    function changeProfile(profile, props){
        let tmpImages = changeImagesProfile(profile, props.attributes.images);

        props.setAttributes({images: tmpImages});
    }


    function changeImagesProfile(profile, images){
        let newList = images.slice();

        for (let i = 0; i < newList.length; i++) {
            newList[i].src = newList[i].original + generateOptionsUriStr({profile: profile});
            newList[i].link = newList[i].original + generateOptionsUriStr({profile: profile});
            newList[i].thumb = newList[i].original + generateOptionsUriStr({profile: profile, thumbnail: 150, image: true});
        }

        return newList;
    }


    function checkProfile(gotProfile, images, props){
        let profile = props.attributes.profile;
        let tmpImages = images;

        if(gotProfile !== profile){
            tmpImages = changeImagesProfile(profile, images);
        }

        return tmpImages;
    }


    function renderInspectorControls( props ){
        let isResponsive = props.attributes.isResponsive == 'true';
        let lazyLoading = props.attributes.lazyLoading == 'true';
        let isLink = props.attributes.isLink == 'true';
        //let isAltCaption = props.attributes.isAltCaption == 'true';
        let width = props.attributes.width;

        return [
                el(InspectorControls,{key: 'inspector'},
                    el(PanelBody, {title: __('Responsive/Static images settings'), },
                        (!isResponsive || isResponsive && width) && el(
                            SelectControl,
                            {
                                label: __('Align'),
                                value: props.attributes.align,
                                options: [
                                    { label: 'Default', value: '' },
                                    { label: 'Left', value: 'alignleft' },
                                    { label: 'Right', value: 'alignright' },
                                    { label: 'Center', value: 'aligncenter' },
                                ],
                                onChange: function ( value ) {
                                    props.setAttributes({align: value});
                                },
                            }
                        ),
                        el(
                            TextControl,
                            {
                                label: __('Width (px)'),
                                value: props.attributes.width,
                                onChange: function( newWidth ){
                                    let width = isNaN(Number(newWidth)) ? '' : newWidth;
                                    props.setAttributes({width: width});
                                },
                            }
                        ),
                        el(
                            ToggleControl,
                            {
                                label: __('Responsive'),
                                checked: isResponsive,
                                instanceId: '',
                                onChange: function ( event ) {
                                    props.setAttributes({isResponsive: '' + event});
                                }
                            }
                        ),
                        isResponsive && el(
                            ToggleControl,
                            {
                                label: __('Lazy loading'),
                                checked: lazyLoading,
                                instanceId: '',
                                onChange: function (event) {
                                    props.setAttributes({lazyLoading: '' + event});
                                }
                            }
                        ),
                        el(
                            ToggleControl,
                            {
                                label: __('Link to big image'),
                                checked: isLink,
                                instanceId: '',
                                onChange: function (event) {
                                    //props.setAttributes({enableAjax: !props.attributes.enableAjax});
                                    props.setAttributes({isLink: '' + event});

                                }
                            }
                        ),
                        /*el(
                            ToggleControl,
                            {
                                label: __('Use caption as ALT'),
                                help: __('If not cheked will  show caption under the image'),
                                checked: isAltCaption,
                                instanceId: '',
                                onChange: function (event) {
                                    //props.setAttributes({enableAjax: !props.attributes.enableAjax});
                                    props.setAttributes({isAltCaption: '' + event});

                                }
                            }
                        ),*/
                        el(RadioControl,
                            {
                                label: __('Caption'),
                                selected: props.attributes.isAltCaption,
                                options: [
                                    {label: 'Show caption and alt text', value: 'true'},
                                    {label: 'Show alt text only', value: 'false'}
                                ],
                                onChange: function ( value ) {
                                        props.setAttributes({isAltCaption: value});
                                    },
                            }
                        ),
                        el(
                            SelectControl,
                            {
                                label: __('Profile'),
                                value: props.attributes.profile,
                                options: getProfiles(props),
                                onChange: function ( value ) {
                                    props.setAttributes({profile: value});
                                    changeProfile(value, props);
                                },
                            }
                        )
                    ),
                ),
        ];
    }



    function renderImagesHtml(props, type){
        let images = props.attributes.images.slice();
        let align = props.attributes.align;
        let width = props.attributes.width;
        let isResponsive = props.attributes.isResponsive == 'true';
        let lazyLoading = props.attributes.lazyLoading == 'true';
        let isLink = props.attributes.isLink == 'true';
        let isAltCaption = props.attributes.isAltCaption == 'true';
        let isSelected = props.isSelected;

        let tmpImagesArr = []

        if(type == 'edit'){
            images.forEach( function(image, index) {
                tmpImagesArr.push(
                    el('li',{className: 'sirv-block-gallery-item'}, [
                        el('figure', {}, [
                            el('DIV', {className: 'sirv-close-button dashicons dashicons-no', 'data-index': index, onClick: function(event){
                                let index = parseInt(event.currentTarget.getAttribute('data-index'));
                                images.splice(index, 1);
                                //props.setAttributes({images: []});
                                let newImages = images.slice();
                                props.setAttributes({images: newImages});
                            }}, ''),
                            el('img', {src: image.thumb, alt: image.alt, onClick: function(event){
                                let liTarget = event.currentTarget.parentNode;
                                if(jQuery(liTarget).hasClass('sirv-is-selected')){
                                    jQuery(liTarget).removeClass('sirv-is-selected');
                                }else{
                                    jQuery.each(jQuery('.sirv-is-selected'), function( index, element ){
                                        jQuery(this).removeClass('sirv-is-selected');
                                    });
                                    liTarget.className  += ' sirv-is-selected';
                                }
                            }}),
                            el('div',{className: 'sirv-img-caption-wrapper'}, [
                                //el('span', {className: 'sirv-img-caption'}, image.alt)
                                el(richText, {
                                    tagName: 'figcaption',
                                    className: 'sirv-img-caption-' + index,
                                    value: image.alt,
                                    onChange: function( newCaption ){
                                        image.alt = newCaption;
                                        //props.setAttributes({images: []});
                                        let newImages = images.slice();
                                        props.setAttributes({images: newImages});
                                    },
                                    placeholder: __('Write caption...'),
                                })
                            ])
                        ])
                    ])
                );
            });
            tmpImagesArr.push(
                isSelected && el('li', {
                        className: 'sirv-block-gallery-item sirv-add-more-images',
                        onClick: function(){
                            window.isSirvGutenberg = true;
                            window.renderSirvModalWindowWithParams(null, false, false, true, function(){
                                window.isSirvGutenberg = false;
                                console.log(window.sirvShObj);
                                if(window.sirvShObj && Object.keys(window.sirvShObj).length > 0){
                                    images = images.concat(window.sirvShObj.sirvSrImages);
                                    images = checkProfile(window.sirvShObj.sirvProfile, images, props);
                                    props.setAttributes({images: images});

                                    window.sirvShObj = {};
                                }
                            });
                        }
                    },
                    el('div', {className: 'sirv-add-more-images-button'},
                        el('span', {className: 'dashicons dashicons-plus-alt'}),
                        el('text', {}, __('Add more images to gallery'))
                    )
                )
            );

        }
        if(type == 'save'){
            let imgAlign = (!isResponsive || (isResponsive && width)) ? align : '';
            let style = {};
            if(!!width && !!Number(width)){style['width'] = width +'px;';} else{style.width = 'auto;'}

            images.forEach( function(image, index) {
                tmpImagesArr.push(
                    el('figure', {
                            className: cssClassesToStr(['sirv-flx', 'sirv-img-container', imgAlign]),
                            style: style,
                        },[renderImgTag(image, width, isResponsive, lazyLoading, isLink),
                        (image.alt && isAltCaption) && el('figcaption',{className: 'sirv-img-container__cap'}, image.alt)
                        ]
                    )
                );
            } );

        }


        return tmpImagesArr;
    }


    function renderImgTag(image, width, isResponsive, lazyLoading, isLink){
        let src = isResponsive ? '' : image.src;
        let dataSrc = isResponsive ? image.src : '';
        let sirvClass = isResponsive ? 'Sirv' : '';
        let dataOptions = !lazyLoading && isResponsive ? 'lazy: false;' : '';

        //if(width && width !==''){
        if (!!width && !!Number(width)) {
            if(src) src = src.search(/\?/i) !== -1 ? src + '&w='+ width : src + '?w=' + width;
        }

        let props = {
            className: cssClassesToStr([sirvClass, 'sirv-img-container__img']),
            alt: image.alt,
            'data-link': image.link,
            'data-thumb': image.thumb,
            'data-original': image.original,
            'data-options': dataOptions,
        };

        if(src){props.src = src;} else{ props['data-src'] = dataSrc;}

        let imgTag = el('img', props);

        let linkTag = el('a',{ className: 'sirv-img-container__link', href: image.link}, [imgTag]);

        let result = isLink ? linkTag : imgTag;

        return result;
    }


    function cssClassesToStr(classesArr){
        let clsStr = '';

        classesArr.forEach( function(cls, index) {
            if(cls){
                if(index == 0) clsStr += cls; else clsStr += ' ' + cls;
            }
        });

        return clsStr;
    }


    registerBlockType( 'sirv/addmedia-block', {
        title: __('Sirv Media'),
        description: __('Create awesome galleries with Sirv'),
        icon: 'format-gallery',
        category: 'common',
        attributes: {
            shId: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-shorcode-g',
                attribute: 'data-id',
            },
            shType: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-shorcode-g',
                attribute: 'data-type',
            },
            shCount: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-shorcode-g',
                attribute: 'data-count',
            },
            shImagesJsonStr: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-shorcode-g',
                attribute: 'data-json-images',
            },
            shImages: {
                type: 'array',
                default: [],
                source: 'query',
                selector: '.sirv-sc-view .sirv-sc-view-img',
                query: {
                    src: {
                        source: 'attribute',
                        selector: 'img',
                        attribute: 'src',
                    }
                },
            },
            lazyLoading: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-lazy-loading',
            },
            profile:{
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-profile',
            },
            profilesJsonStr: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-json-profiles',
            },
            align:{
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-align',
            },
            isAltCaption:{
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-alt-caption',
            },
            isResponsive: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-isresponsive',
            },
            isLink: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-link',
            },
            width: {
                type: 'string',
                source: 'attribute',
                selector: '.sirv-block-gallery-div',
                attribute: 'data-width',
            },
            images: {
                type: 'array',
                default: [],
                source: 'query',
                selector: '.sirv-block-gallery-div figure .sirv-img-container__img',
                query: {
                    alt: {
                        type: 'string',
                        source: 'attribute',
                        attribute: 'alt',
                        default: '',
                    },
                    link: {
                        type: 'string',
                        source: 'attribute',
                        attribute: 'data-link',
                    },
                    original: {
                        type: 'string',
                        source: 'attribute',
                        attribute: 'data-original',
                    },
                    src: {
                        type: 'string',
                        source: 'attribute',
                        attribute: 'data-link',
                    },
                    thumb: {
                        type: 'string',
                        source: 'attribute',
                        attribute: 'data-thumb',
                        default: '',
                    },
                },
            },
        },

        edit: function( props ) {


            let shId =  props.attributes.shId || '';
            let images = props.attributes.images || [];


            if(!shId && images.length == 0 ){
                return el('div', {
                        className: 'sirv-g-start-div components-placeholder',
                        },[
                            el('div',{
                                className: 'sirv-modal',
                            }, ''),
                            el('div',{
                                className: 'sirv-g-icon-wrapper components-placeholder__label',
                            },
                                el('img',{
                                    className: 'sirv-g-icon',
                                    src: sirv_ajax_object.assets_path + '/ico_img_blue.svg',
                                }),
                                el('text', {}, __('Sirv Media')),
                            ),
                            el('div',{
                                className: 'sirv-g-desc components-placeholder__instructions',
                            }, 'Insert an image, image gallery, responsive image, zoom or 360 spin.'),
                            el(button, {
                                className: 'button button-large sirv-g-add-media',
                                onClick: function(){
                                    window.isSirvGutenberg = true;
                                    window.renderSirvModalWindowWithParams(null, false, true, false, function(){
                                        window.isSirvGutenberg = false;
                                        if(window.sirvShObj && Object.keys(window.sirvShObj).length > 0){
                                            props.setAttributes({shId: (window.sirvShObj.sirvId).toString(),
                                                                shType: (window.sirvShObj.sirvType).toString(),
                                                                shCount: (window.sirvShObj.sirvCount).toString(),
                                                                shImages: window.sirvShObj.sirvImages,
                                                                shImagesJsonStr: window.sirvShObj.sirvImagesJson,
                                                                images: window.sirvShObj.sirvSrImages,
                                                                align: window.sirvShObj.sirvAlign,
                                                                width: window.sirvShObj.sirvWidth,
                                                                isResponsive: window.sirvShObj.sirvIsResponsive,
                                                                lazyLoading: window.sirvShObj.sirvIsLazyLoading,
                                                                isLink: window.sirvShObj.sirvIsLink,
                                                                isAltCaption: window.sirvShObj.sirvIsAltCaption,
                                                                profile: window.sirvShObj.sirvProfile,
                                                                profilesJsonStr: window.sirvShObj.sirvProfiles,
                                            });
                                            window.sirvShObj = {};
                                        }
                                    });
                                },
                            }, 'Add Sirv Media')
                        ]
                );
            }

            if(shId){
                let shType = props.attributes.shType;
                let shCount = props.attributes.shCount;
                let shImages = props.attributes.shImages;
                let shImagesJsonStr = props.attributes.shImagesJsonStr;

                function renderShortcodeImages(images){
                    let imagesElArr = [];

                    let tmpImages = JSON.parse(images);
                    tmpImages.forEach(function(elem){
                        imagesElArr.push( el('img', {src: elem, className: 'sirv-sc-view-img'}) );
                    });

                    return imagesElArr;
                }


                return el('DIV', {
                    className: 'sirv-sc-view',
                    'data-id': shId,
                    'data-type': shType,
                    'data-count': shCount,
                }, [
                    el('DIV', {className: 'sirv-modal'}, ''),
                    el('div', {
                        className: 'sirv-overlay',
                        'data-id': shId,
                    }, [
                        el('span', {
                            className: 'sirv-overlay-text',
                        }, shType + ': ' + shCount + ' item(s)'),
                        el('a', {
                            className: 'sirv-delete-sc-view .sirv-no-select-text sc-view-button sc-buttons-hide dashicons dashicons-no',
                            href: '#',
                            title: 'Delete gallery',
                            'data-id': shId,
                            onClick: function(){
                                props.setAttributes({shId: ''});
                            },
                        }, ''),
                        el('a', {
                            className: 'sirv-edit-sc-view .sirv-no-select-text sc-view-button sc-buttons-hide dashicons dashicons-admin-generic',
                            href: '#',
                            title: 'Edit gallery',
                            onClick: function(){
                                window.isSirvGutenberg = true;
                                window.renderSirvModalWindowWithParams(shId, true, false, false, function(){
                                    window.isSirvGutenberg = false;
                                    if(window.sirvShObj && Object.keys(window.sirvShObj).length > 0){
                                        props.setAttributes({shId: (window.sirvShObj.sirvId).toString(),
                                                            shType: (window.sirvShObj.sirvType).toString(),
                                                            shCount: (window.sirvShObj.sirvCount).toString(),
                                                            shImages: window.sirvShObj.sirvImages,
                                                            shImagesJsonStr: window.sirvShObj.sirvImagesJson,
                                        });

                                        //window.tmpTest = window.sirvShObj;

                                        window.sirvShObj = {};
                                    }
                                });
                            },
                        }, ''),
                    ]),
                    renderShortcodeImages(shImagesJsonStr),
                ]);
            }

            if(images.length > 0){
                let align = props.attributes.align;
                let width = props.attributes.width;
                let isResponsive = props.attributes.isResponsive;
                let lazyLoading = props.attributes.lazyLoading;
                let isLink = props.attributes.isLink;
                let isAltCaption = props.attributes.isAltCaption;
                let profile = props.attributes.profile;
                let profiles = props.attributes.profilesJsonStr;

                return [
                        el('DIV', {className: 'sirv-modal'}),
                        el('ul', {
                            className: 'sirv-block-gallery',
                            'data-align': align,
                            'data-width': width,
                            'data-isresponsive': isResponsive,
                            'data-lazy-loading': lazyLoading,
                            'data-link': isLink,
                            'data-alt-caption': isAltCaption,
                            'data-profile': profile,
                            'data-json-profiles': profiles,

                        }, renderImagesHtml(props, 'edit')),
                        renderInspectorControls(props)
                ];
            }
        },

        save: function( props ){
            let shId =  props.attributes.shId || '';
            let images = props.attributes.images || [];

            if(shId){
                let shType = props.attributes.shType;
                let shCount = props.attributes.shCount;
                let shImages = props.attributes.shImages;
                let shImagesJsonStr = props.attributes.shImagesJsonStr;

                return el('div', {
                    className: 'sirv-shorcode-g',
                    'data-id': shId,
                    'data-type': shType,
                    'data-count': shCount,
                    'data-json-images': shImagesJsonStr,
                }, '[sirv-gallery id='+ shId +']');
            }

            if(images.length > 0){
                let align = props.attributes.align;
                let width = props.attributes.width;
                let isResponsive = props.attributes.isResponsive;
                let lazyLoading = props.attributes.lazyLoading;
                let isLink = props.attributes.isLink;
                let isAltCaption = props.attributes.isAltCaption;
                let profile = props.attributes.profile;
                let profiles = props.attributes.profilesJsonStr;

                return el('div', {
                    className: 'sirv-block-gallery-div',
                    'data-align': align,
                    'data-width': width,
                    'data-isresponsive': isResponsive,
                    'data-lazy-loading': lazyLoading,
                    'data-link': isLink,
                    'data-alt-caption': isAltCaption,
                    'data-profile': profile,
                    'data-json-profiles': profiles,
                }, renderImagesHtml(props, 'save'));
            }
        },
    });

})(window.wp.element, window.wp.blocks, window.wp.components, window.wp.blockEditor, window.wp.i18n);
